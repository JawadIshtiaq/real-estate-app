create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles
  add constraint profiles_role_check check (role in ('buyer', 'seller', 'admin'));

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null,
  beds int not null default 0,
  baths int not null default 0,
  sqft int not null default 0,
  status text not null default 'active' check (status in ('active', 'pending', 'sold')),
  city text,
  neighborhood text,
  hero_image_url text,
  created_by uuid references profiles (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

create table if not exists favorites (
  user_id uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  user_id uuid references profiles (id),
  name text,
  email text,
  message text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table favorites enable row level security;
alter table inquiries enable row level security;

drop policy if exists "Profiles are readable by owner" on profiles;
create policy "Profiles are readable by owner"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles can update own profile" on profiles;
create policy "Profiles can update own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles can insert own profile" on profiles;
create policy "Profiles can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Public listings are readable" on listings;
create policy "Public listings are readable"
  on listings for select
  using (true);

drop policy if exists "Agents can insert listings" on listings;
drop policy if exists "Sellers can insert listings" on listings;
create policy "Sellers can insert listings"
  on listings for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('seller', 'admin')
    )
  );
drop policy if exists "Agents can update own listings" on listings;
drop policy if exists "Sellers can update own listings" on listings;
create policy "Sellers can update own listings"
  on listings for update
  using (
    auth.uid() = created_by
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    auth.uid() = created_by
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Sellers can delete own listings" on listings;
create policy "Sellers can delete own listings"
  on listings for delete
  using (
    auth.uid() = created_by
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Listing images readable" on listing_images;
create policy "Listing images readable"
  on listing_images for select
  using (true);

drop policy if exists "Favorites readable by owner" on favorites;
create policy "Favorites readable by owner"
  on favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Favorites writable by owner" on favorites;
create policy "Favorites writable by owner"
  on favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Favorites deletable by owner" on favorites;
create policy "Favorites deletable by owner"
  on favorites for delete
  using (auth.uid() = user_id);

drop policy if exists "Inquiries readable by listing owner or admin" on inquiries;
create policy "Inquiries readable by listing owner or admin"
  on inquiries for select
  using (exists (
    select 1 from listings
    join profiles on profiles.id = listings.created_by
    where listings.id = inquiries.listing_id
      and (profiles.id = auth.uid() or profiles.role = 'admin')
  ));

drop policy if exists "Inquiries insert for any visitor" on inquiries;
create policy "Inquiries insert for any visitor"
  on inquiries for insert
  with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow role to be set on sign-up, but never allow 'admin' from client metadata.
  -- Any non-seller or missing value becomes buyer.
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    case
      when new.raw_user_meta_data->>'role' = 'seller' then 'seller'
      else 'buyer'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow switching between buyer and seller from the client.
  -- Only block any attempt to set admin.
  if new.role is distinct from old.role and new.role = 'admin' then
    raise exception 'Role changes are not allowed from client.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_role_change();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
