-- Barusik Platforms: one account for every platform + Platformika data + admin page.
-- Runs on the Supabase project that Complichess already uses (accounts live in auth.users + public.profiles).
-- Safe to run more than once.

-- ============ admins ============
create table if not exists public.barusik_admins (email text primary key);
alter table public.barusik_admins enable row level security;            -- no policies: never readable from the app
insert into public.barusik_admins (email) values ('barusik.official@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u join public.barusik_admins a on lower(a.email) = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ============ Platformika ============
create table if not exists public.pk_profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique check (handle ~ '^[a-z0-9._]{3,24}$'),
  name text not null check (char_length(name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 160),
  avatar_url text, cover_url text,
  hue int not null default 250,
  created_at timestamptz not null default now()
);
create table if not exists public.pk_posts (
  id uuid primary key default gen_random_uuid(),
  author uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null default 'post' check (kind in ('post', 'clip', 'story')),
  body text not null default '' check (char_length(body) <= 2200),
  media_url text, media_type text check (media_type is null or media_type in ('image', 'video')),
  bg int,
  created_at timestamptz not null default now()
);
create index if not exists pk_posts_created on public.pk_posts (created_at desc);
create index if not exists pk_posts_author on public.pk_posts (author, created_at desc);
create table if not exists public.pk_likes (
  post uuid not null references public.pk_posts on delete cascade,
  uid uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post, uid)
);
create table if not exists public.pk_comments (
  id uuid primary key default gen_random_uuid(),
  post uuid not null references public.pk_posts on delete cascade,
  author uuid not null default auth.uid() references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists pk_comments_post on public.pk_comments (post, created_at);
create table if not exists public.pk_messages (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null default auth.uid() references auth.users on delete cascade,
  recipient uuid not null references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists pk_messages_pair on public.pk_messages (sender, recipient, created_at);
create index if not exists pk_messages_to on public.pk_messages (recipient, created_at);

alter table public.pk_profiles enable row level security;
alter table public.pk_posts enable row level security;
alter table public.pk_likes enable row level security;
alter table public.pk_comments enable row level security;
alter table public.pk_messages enable row level security;

drop policy if exists "pk_profiles read" on public.pk_profiles;
create policy "pk_profiles read" on public.pk_profiles for select using (true);
drop policy if exists "pk_profiles own insert" on public.pk_profiles;
create policy "pk_profiles own insert" on public.pk_profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "pk_profiles own update" on public.pk_profiles;
create policy "pk_profiles own update" on public.pk_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "pk_posts read" on public.pk_posts;
create policy "pk_posts read" on public.pk_posts for select using (kind <> 'story' or created_at > now() - interval '24 hours' or author = auth.uid());
drop policy if exists "pk_posts own insert" on public.pk_posts;
create policy "pk_posts own insert" on public.pk_posts for insert to authenticated with check (author = auth.uid());
drop policy if exists "pk_posts own delete" on public.pk_posts;
create policy "pk_posts own delete" on public.pk_posts for delete to authenticated using (author = auth.uid() or public.is_admin());

drop policy if exists "pk_likes read" on public.pk_likes;
create policy "pk_likes read" on public.pk_likes for select using (true);
drop policy if exists "pk_likes own insert" on public.pk_likes;
create policy "pk_likes own insert" on public.pk_likes for insert to authenticated with check (uid = auth.uid());
drop policy if exists "pk_likes own delete" on public.pk_likes;
create policy "pk_likes own delete" on public.pk_likes for delete to authenticated using (uid = auth.uid());

drop policy if exists "pk_comments read" on public.pk_comments;
create policy "pk_comments read" on public.pk_comments for select using (true);
drop policy if exists "pk_comments own insert" on public.pk_comments;
create policy "pk_comments own insert" on public.pk_comments for insert to authenticated with check (author = auth.uid());
drop policy if exists "pk_comments delete" on public.pk_comments;
create policy "pk_comments delete" on public.pk_comments for delete to authenticated using (
  author = auth.uid() or public.is_admin() or exists (select 1 from public.pk_posts p where p.id = post and p.author = auth.uid()));

drop policy if exists "pk_messages mine" on public.pk_messages;
create policy "pk_messages mine" on public.pk_messages for select to authenticated using (sender = auth.uid() or recipient = auth.uid());
drop policy if exists "pk_messages send" on public.pk_messages;
create policy "pk_messages send" on public.pk_messages for insert to authenticated with check (sender = auth.uid());

-- live updates in the app
do $$ begin
  begin alter publication supabase_realtime add table public.pk_posts; exception when others then null; end;
  begin alter publication supabase_realtime add table public.pk_comments; exception when others then null; end;
  begin alter publication supabase_realtime add table public.pk_likes; exception when others then null; end;
  begin alter publication supabase_realtime add table public.pk_messages; exception when others then null; end;
end $$;

-- photos and videos: public bucket, each user writes only inside a folder named with their id
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pk-media', 'pk-media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "pk-media read" on storage.objects;
create policy "pk-media read" on storage.objects for select using (bucket_id = 'pk-media');
drop policy if exists "pk-media own upload" on storage.objects;
create policy "pk-media own upload" on storage.objects for insert to authenticated with check (bucket_id = 'pk-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "pk-media own delete" on storage.objects;
create policy "pk-media own delete" on storage.objects for delete to authenticated using (bucket_id = 'pk-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ============ admin overview (only for emails in barusik_admins) ============
create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare out jsonb; m jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select jsonb_build_object(
    'generated_at', now(),
    'users', coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object(
        'id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at,
        'confirmed', u.email_confirmed_at is not null,
        'complichess', (select to_jsonb(p) from public.profiles p where p.id = u.id),
        'platformika', jsonb_build_object(
          'profile', (select to_jsonb(k) from public.pk_profiles k where k.id = u.id),
          'posts', (select count(*) from public.pk_posts where author = u.id and kind = 'post'),
          'clips', (select count(*) from public.pk_posts where author = u.id and kind = 'clip'),
          'stories', (select count(*) from public.pk_posts where author = u.id and kind = 'story'),
          'comments', (select count(*) from public.pk_comments where author = u.id),
          'likes_given', (select count(*) from public.pk_likes where uid = u.id),
          'likes_received', (select count(*) from public.pk_likes l join public.pk_posts p on p.id = l.post where p.author = u.id),
          'messages_sent', (select count(*) from public.pk_messages where sender = u.id))
      ) x from auth.users u) t), '[]'::jsonb),
    'totals', jsonb_build_object(
      'users', (select count(*) from auth.users),
      'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'active_7d', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
      'pk_posts', (select count(*) from public.pk_posts),
      'pk_comments', (select count(*) from public.pk_comments),
      'pk_likes', (select count(*) from public.pk_likes),
      'pk_messages', (select count(*) from public.pk_messages)),
    'pk_recent', coalesce((select jsonb_agg(r) from (select p.id, p.kind, left(p.body, 140) as body, p.media_type, p.created_at, k.handle
       from public.pk_posts p left join public.pk_profiles k on k.id = p.author order by p.created_at desc limit 40) r), '[]'::jsonb)
  ) into out;
  begin
    if to_regclass('public.matches') is not null then
      execute 'select jsonb_build_object(''total'', count(*), ''by_status'', (select jsonb_object_agg(coalesce(status, ''?''), n) from (select status, count(*) n from public.matches group by status) s)) from public.matches' into m;
      out := out || jsonb_build_object('cx_matches', m);
    end if;
  exception when others then null;
  end;
  return out;
end $$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
