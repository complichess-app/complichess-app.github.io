-- © 2026 Bar Lvovski. All rights reserved.
-- Penina (chat reports). Every report needs Bar's approval: the customer sends a request, it shows on /admin/,
-- Bar approves or declines, and only an approved request can turn into a report.
-- The chat itself is never stored here: only the request (who, when, how many messages / people, language).
-- Later a payment can approve requests automatically (pn_admin_decide is the one place that grants a report).
-- Safe to run more than once.

drop table if exists public.pn_usage cascade;           -- replaced by requests (0.1 had a free daily report)
drop function if exists public.pn_refund();

create table if not exists public.pn_requests (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'used')),
  decided_at timestamptz,
  used_at timestamptz,
  msgs int not null default 0 check (msgs >= 0),
  people int not null default 0 check (people >= 0),
  lang text not null default 'he' check (lang in ('he', 'en', 'ar', 'ru', 'es', 'fr')),
  paid boolean not null default false                    -- for the future payment hookup
);
create index if not exists pn_requests_uid on public.pn_requests (uid, created_at desc);
create index if not exists pn_requests_pending on public.pn_requests (created_at) where status = 'pending';
alter table public.pn_requests enable row level security;
drop policy if exists "pn_requests own" on public.pn_requests;
create policy "pn_requests own" on public.pn_requests for select to authenticated using (uid = auth.uid() or public.is_admin());

-- the customer asks for a report (at most 3 waiting at once)
create or replace function public.pn_request(p_msgs int, p_people int, p_lang text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); r public.pn_requests;
begin
  if u is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if (select count(*) from public.pn_requests where uid = u and status = 'pending') >= 3 then
    raise exception 'too many waiting' using errcode = 'P0001';
  end if;
  insert into public.pn_requests (uid, msgs, people, lang)
  values (u, greatest(0, least(coalesce(p_msgs, 0), 10000000)), greatest(0, least(coalesce(p_people, 0), 1000)),
          case when p_lang in ('he', 'en', 'ar', 'ru', 'es', 'fr') then p_lang else 'he' end)
  returning * into r;
  return jsonb_build_object('id', r.id, 'status', r.status);
end $$;

-- the report function takes one approved request (Bar himself never needs one)
create or replace function public.pn_take_report() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); rid uuid;
begin
  if u is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if public.is_admin() then return jsonb_build_object('ok', true, 'id', null); end if;
  select id into rid from public.pn_requests where uid = u and status = 'approved' order by decided_at limit 1 for update skip locked;
  if rid is null then raise exception 'not approved' using errcode = 'P0001'; end if;
  update public.pn_requests set status = 'used', used_at = now() where id = rid;
  return jsonb_build_object('ok', true, 'id', rid);
end $$;

-- only the server may give a request back when Claude failed (a user calling it could loop for free reports)
create or replace function public.pn_refund(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.pn_requests set status = 'approved', used_at = null where id = p_id and status = 'used';
end $$;

-- admin: the queue, and approve / decline
create or replace function public.pn_admin_list() returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x order by (x->>'status') <> 'pending', x->>'created_at' desc) from (
    select jsonb_build_object('id', r.id, 'email', u.email, 'created_at', r.created_at, 'status', r.status, 'msgs', r.msgs,
                              'people', r.people, 'lang', r.lang, 'paid', r.paid, 'decided_at', r.decided_at, 'used_at', r.used_at) x
      from public.pn_requests r join auth.users u on u.id = r.uid
     where r.status = 'pending' or r.created_at > now() - interval '30 days'
     order by r.created_at desc limit 200) t), '[]'::jsonb);
end $$;

create or replace function public.pn_admin_decide(p_id uuid, p_approve boolean) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  update public.pn_requests set status = case when p_approve then 'approved' else 'declined' end, decided_at = now()
   where id = p_id and status = 'pending';
  return case when p_approve then 'approved' else 'declined' end;
end $$;

-- how many requests wait for Bar (for the light next to the account button)
create or replace function public.pn_pending_count() returns int language sql stable security definer set search_path = public as $$
  select case when public.is_admin() then (select count(*)::int from public.pn_requests where status = 'pending') else 0 end;
$$;

revoke all on function public.pn_request(int, int, text), public.pn_take_report(), public.pn_refund(uuid),
  public.pn_admin_list(), public.pn_admin_decide(uuid, boolean), public.pn_pending_count() from public, anon, authenticated;
grant execute on function public.pn_request(int, int, text), public.pn_take_report(), public.pn_admin_list(),
  public.pn_admin_decide(uuid, boolean), public.pn_pending_count() to authenticated;
grant execute on function public.pn_refund(uuid) to service_role;
