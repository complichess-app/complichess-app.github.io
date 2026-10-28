-- © 2026 Bar Lvovski. All rights reserved.
-- Penina (chat reports): only a usage counter lives here. Chats are never stored — not here, not in logs.
create table if not exists public.pn_usage (
  uid uuid not null references auth.users on delete cascade,
  day date not null default (now() at time zone 'Asia/Jerusalem')::date,
  reports int not null default 0,
  credits int not null default 0,          -- paid reports on top of the free daily one (filled by a payment webhook later)
  primary key (uid, day)
);
alter table public.pn_usage enable row level security;
drop policy if exists "pn_usage own" on public.pn_usage;
create policy "pn_usage own" on public.pn_usage for select to authenticated using (uid = auth.uid());

-- called by the edge function with the user's own token: takes one report from today's allowance or fails
create or replace function public.pn_take_report() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); d date := (now() at time zone 'Asia/Jerusalem')::date; r public.pn_usage; free int := 1;
begin
  if u is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if public.is_admin() then return jsonb_build_object('ok', true, 'left', 999); end if;
  insert into public.pn_usage (uid, day) values (u, d) on conflict do nothing;
  select * into r from public.pn_usage where uid = u and day = d for update;
  if r.reports >= free + r.credits then raise exception 'daily limit' using errcode = 'P0001'; end if;
  update public.pn_usage set reports = reports + 1 where uid = u and day = d;
  return jsonb_build_object('ok', true, 'left', free + r.credits - r.reports - 1);
end $$;
-- gives the report back if Claude failed, so a failed report does not cost the user
-- only the server (service role) may refund; a user calling it could otherwise loop for free reports
create or replace function public.pn_refund(p_uid uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.pn_usage set reports = greatest(0, reports - 1) where uid = p_uid and day = (now() at time zone 'Asia/Jerusalem')::date;
end $$;
revoke all on function public.pn_take_report(), public.pn_refund(uuid) from public, anon, authenticated;
grant execute on function public.pn_take_report() to authenticated;
grant execute on function public.pn_refund(uuid) to service_role;
