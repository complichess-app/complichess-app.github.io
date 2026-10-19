-- Bar Lvovski Travel: Bar's own computer is the search server.
-- Customers ask for a search → a job row. Bar's admin page (with the Chrome extension) picks it up, runs it in his
-- logged-in BeAgent, and writes the result back. Customers only reach the jobs through the two functions below.

create table if not exists public.travel_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('search', 'suggest', 'pkgdates')),
  key text not null check (char_length(key) <= 800),
  params jsonb not null check (pg_column_size(params) < 4000),
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  result jsonb check (result is null or pg_column_size(result) < 400000),
  error text check (error is null or char_length(error) <= 300),
  updated_at timestamptz not null default now()
);
create index if not exists travel_jobs_key on public.travel_jobs (key, created_at desc);
create index if not exists travel_jobs_queue on public.travel_jobs (status, created_at);
alter table public.travel_jobs enable row level security;
drop policy if exists "travel jobs admin" on public.travel_jobs;
create policy "travel jobs admin" on public.travel_jobs for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.travel_worker (
  id int primary key default 1 check (id = 1),
  last_seen timestamptz,
  logged_in boolean not null default true,
  version int
);
alter table public.travel_worker enable row level security;
drop policy if exists "travel worker admin" on public.travel_worker;
create policy "travel worker admin" on public.travel_worker for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.travel_worker (id) values (1) on conflict do nothing;

-- Customer: ask for a job. Same question asked recently → the same job (answers repeat searches instantly).
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
  if (select count(*) from travel_jobs where created_at > now() - interval '1 minute') > 400 then raise exception 'busy'; end if;
  insert into travel_jobs (kind, key, params) values (p_kind, k, p_params) returning id into jid;
  if random() < 0.02 then delete from travel_jobs where created_at < now() - interval '2 days'; end if;
  return jid;
end $$;

-- Customer: read one job's answer (only by its id).
create or replace function public.travel_job(p_id uuid)
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object('status', status, 'result', result, 'error', error) from travel_jobs where id = p_id;
$$;

-- Customer: is Bar's computer answering right now?
create or replace function public.travel_status()
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object('online', coalesce(last_seen > now() - interval '50 seconds', false) and logged_in, 'seen', last_seen)
  from travel_worker where id = 1;
$$;

-- Bar's server page: "I'm alive" every few seconds (server clock, admin only). p_on = false switches the light off now.
create or replace function public.travel_heartbeat(p_on boolean, p_logged_in boolean default true, p_version int default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update travel_worker set last_seen = case when p_on then now() else null end, logged_in = coalesce(p_logged_in, true), version = p_version where id = 1;
end $$;
revoke all on function public.travel_heartbeat(boolean, boolean, int) from public;
grant execute on function public.travel_heartbeat(boolean, boolean, int) to authenticated;

revoke all on function public.travel_submit(text, jsonb) from public;
revoke all on function public.travel_job(uuid) from public;
revoke all on function public.travel_status() from public;
grant execute on function public.travel_submit(text, jsonb) to anon, authenticated;
grant execute on function public.travel_job(uuid) to anon, authenticated;
grant execute on function public.travel_status() to anon, authenticated;

do $$ begin
  begin alter publication supabase_realtime add table public.travel_jobs; exception when others then null; end;
end $$;
