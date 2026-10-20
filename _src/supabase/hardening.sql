-- Barusik hardening (2026-10-20). Run once in Supabase → SQL Editor, AFTER barusik.sql, travel.sql and travel_jobs.sql.
-- Safe to run more than once. Nothing here deletes existing data.
--   1. Rate limits: customer searches (travel_submit) and booking requests (travel_requests) per visitor + overall
--   2. Platformika media links must point at our own storage bucket (no outside tracking pixels)
--   3. Platformika: block users, report users/posts
--   4. "Delete my account" for every platform account

-- ============ 1. rate limits ============
-- Visitors are counted by a hash of their IP (the IP itself is never stored).
create table if not exists public.rate_hits (
  bucket text not null,
  who text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_lookup on public.rate_hits (bucket, who, at desc);
create index if not exists rate_hits_bucket on public.rate_hits (bucket, at desc);
alter table public.rate_hits enable row level security;   -- no policies: only the functions below touch it

create or replace function public.client_key() returns text
language sql stable set search_path = public as $$
  select md5(coalesce(
    nullif(current_setting('request.headers', true), '')::json->>'cf-connecting-ip',
    split_part(nullif(current_setting('request.headers', true), '')::json->>'x-forwarded-for', ',', 1),
    'unknown') || ':barusik');
$$;

-- true when allowed (and the hit is recorded); false when over either limit
create or replace function public.rate_ok(p_bucket text, p_per_visitor int, p_visitor_window interval, p_overall int, p_overall_window interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare k text := public.client_key();
begin
  if (select count(*) from rate_hits where bucket = p_bucket and who = k and at > now() - p_visitor_window) >= p_per_visitor then return false; end if;
  if (select count(*) from rate_hits where bucket = p_bucket and at > now() - p_overall_window) >= p_overall then return false; end if;
  insert into rate_hits (bucket, who) values (p_bucket, k);
  if random() < 0.02 then delete from rate_hits where at < now() - interval '1 day'; end if;
  return true;
end $$;
revoke all on function public.rate_ok(text, int, interval, int, interval) from public, anon, authenticated;
revoke all on function public.client_key() from public, anon, authenticated;

-- Customer searches: same as before, but a NEW search (one that isn't answered from the cache) is limited to
-- 15 per visitor per 5 minutes and 60 per minute overall. Cached answers stay unlimited and instant.
create or replace function public.travel_submit(p_kind text, p_params jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare k text; jid uuid; ttl interval;
begin
  if p_kind not in ('search', 'suggest', 'pkgdates') then raise exception 'bad kind'; end if;
  if p_params is null or jsonb_typeof(p_params) <> 'object' or pg_column_size(p_params) > 3000 then raise exception 'bad params'; end if;
  k := p_kind || ':' || p_params::text;
  if char_length(k) > 800 then raise exception 'bad params'; end if;
  ttl := case p_kind when 'search' then interval '10 minutes' when 'suggest' then interval '6 hours' else interval '1 hour' end;
  select id into jid from travel_jobs
    where key = k and ((status = 'done' and updated_at > now() - ttl) or (status in ('queued', 'running') and created_at > now() - interval '2 minutes'))
    order by created_at desc limit 1;
  if jid is not null then return jid; end if;
  if p_kind = 'search' then
    if not public.rate_ok('search', 15, interval '5 minutes', 60, interval '1 minute') then raise exception 'busy'; end if;
  else
    if not public.rate_ok('suggest', 120, interval '5 minutes', 400, interval '1 minute') then raise exception 'busy'; end if;
  end if;
  insert into travel_jobs (kind, key, params) values (p_kind, k, p_params) returning id into jid;
  if random() < 0.02 then delete from travel_jobs where created_at < now() - interval '2 days'; end if;
  return jid;
end $$;
revoke all on function public.travel_submit(text, jsonb) from public;
grant execute on function public.travel_submit(text, jsonb) to anon, authenticated;

-- Booking requests: 4 per visitor per 30 minutes, 60 per hour overall.
create or replace function public.travel_requests_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.rate_ok('travel_request', 4, interval '30 minutes', 60, interval '1 hour') then
    raise exception 'too many requests, try again later' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists travel_requests_guard on public.travel_requests;
create trigger travel_requests_guard before insert on public.travel_requests for each row execute function public.travel_requests_guard();

-- ============ 2. media links must be our own storage ============
-- NOT VALID: existing rows are left alone, every new or edited row is checked.
do $$
declare base text := 'https://iktmyrfbejtjsiehcrar.supabase.co/storage/v1/object/public/pk-media/';
begin
  begin execute format('alter table public.pk_posts add constraint pk_posts_media_ours check (media_url is null or media_url = %L or left(media_url, %s) = %L) not valid', '', length(base), base); exception when duplicate_object then null; end;
  begin execute format('alter table public.pk_profiles add constraint pk_profiles_avatar_ours check (avatar_url is null or avatar_url = %L or left(avatar_url, %s) = %L) not valid', '', length(base), base); exception when duplicate_object then null; end;
  begin execute format('alter table public.pk_profiles add constraint pk_profiles_cover_ours check (cover_url is null or cover_url = %L or left(cover_url, %s) = %L) not valid', '', length(base), base); exception when duplicate_object then null; end;
end $$;

-- ============ 3. block and report ============
create table if not exists public.pk_blocks (
  blocker uuid not null default auth.uid() references auth.users on delete cascade,
  blocked uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.pk_blocks enable row level security;
drop policy if exists "pk_blocks mine" on public.pk_blocks;
create policy "pk_blocks mine" on public.pk_blocks for select to authenticated using (blocker = auth.uid());
drop policy if exists "pk_blocks add" on public.pk_blocks;
create policy "pk_blocks add" on public.pk_blocks for insert to authenticated with check (blocker = auth.uid());
drop policy if exists "pk_blocks remove" on public.pk_blocks;
create policy "pk_blocks remove" on public.pk_blocks for delete to authenticated using (blocker = auth.uid());

-- a blocked person can no longer send you messages
drop policy if exists "pk_messages send" on public.pk_messages;
create policy "pk_messages send" on public.pk_messages for insert to authenticated with check (
  sender = auth.uid()
  and not exists (select 1 from public.pk_blocks b where b.blocker = recipient and b.blocked = auth.uid()));

create table if not exists public.pk_reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null default auth.uid() references auth.users on delete cascade,
  target_user uuid references auth.users on delete cascade,
  post uuid references public.pk_posts on delete set null,
  reason text not null check (char_length(reason) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  check (target_user is not null or post is not null)
);
alter table public.pk_reports enable row level security;
drop policy if exists "pk_reports send" on public.pk_reports;
create policy "pk_reports send" on public.pk_reports for insert to authenticated with check (reporter = auth.uid() and status = 'open');
drop policy if exists "pk_reports admin read" on public.pk_reports;
create policy "pk_reports admin read" on public.pk_reports for select to authenticated using (public.is_admin());
drop policy if exists "pk_reports admin update" on public.pk_reports;
create policy "pk_reports admin update" on public.pk_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.pk_reports_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from pk_reports where reporter = auth.uid() and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too many reports, try again later';
  end if;
  return new;
end $$;
drop trigger if exists pk_reports_guard on public.pk_reports;
create trigger pk_reports_guard before insert on public.pk_reports for each row execute function public.pk_reports_guard();

-- ============ 4. delete my account ============
-- The app first removes the user's own files from storage (the storage API), then calls this.
-- Everything that references auth.users with "on delete cascade" goes with it (Platformika data, blocks, reports).
-- Complichess tables are cleaned only if they exist; travel booking requests have no user link and stay for the records.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'the admin account cannot be deleted from the app'; end if;
  if to_regclass('public.profiles') is not null then execute 'delete from public.profiles where id = $1' using uid; end if;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
