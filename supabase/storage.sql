insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read listing images" on storage.objects;
create policy "Public read listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

drop policy if exists "Sellers upload listing images" on storage.objects;
create policy "Sellers upload listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid() = owner
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('seller', 'admin')
    )
  );

drop policy if exists "Sellers delete own listing images" on storage.objects;
create policy "Sellers delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid() = owner
  );
