-- Bar Lvovski Travel: booking requests from travel.barusik.com. Anyone may send one; only the admin can read or update them.
create table if not exists public.travel_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('hotels', 'flights', 'cars', 'packages', 'tours', 'tickets')),
  details jsonb not null default '{}'::jsonb check (pg_column_size(details) < 8000),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (email is null or char_length(email) <= 120),
  notes text check (notes is null or char_length(notes) <= 1500),
  lang text,
  status text not null default 'new' check (status in ('new', 'quoted', 'paid', 'closed', 'cancelled')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1500),
  updated_at timestamptz not null default now()
);
create index if not exists travel_requests_created on public.travel_requests (created_at desc);
alter table public.travel_requests enable row level security;

drop policy if exists "travel send" on public.travel_requests;
create policy "travel send" on public.travel_requests for insert to anon, authenticated
  with check (status = 'new' and admin_note is null);
drop policy if exists "travel admin read" on public.travel_requests;
create policy "travel admin read" on public.travel_requests for select to authenticated using (public.is_admin());
drop policy if exists "travel admin update" on public.travel_requests;
create policy "travel admin update" on public.travel_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- new requests show up live on the admin page
do $$ begin
  begin alter publication supabase_realtime add table public.travel_requests; exception when others then null; end;
end $$;
