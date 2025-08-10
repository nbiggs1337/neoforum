-- Storage RLS policies for 'user-uploads' bucket
-- Users can only write to a folder that matches their auth.uid()
-- Bucket can be read via public URL; this SELECT policy allows metadata reads.
-- Note: No ALTER TABLE here (avoids "must be owner of table objects")

-- INSERT: authenticated users can upload if first folder equals their user id
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own files (user-uploads)'
  ) then
    create policy "Users can upload their own files (user-uploads)"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'user-uploads'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;

-- SELECT: allow selecting metadata in this bucket
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can view files (user-uploads)'
  ) then
    create policy "Users can view files (user-uploads)"
      on storage.objects
      for select
      using (
        bucket_id = 'user-uploads'
      );
  end if;
end
$$;

-- UPDATE: authenticated owner can update their own files
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own files (user-uploads)'
  ) then
    create policy "Users can update their own files (user-uploads)"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'user-uploads'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'user-uploads'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;

-- DELETE: authenticated owner can delete their own files
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own files (user-uploads)'
  ) then
    create policy "Users can delete their own files (user-uploads)"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'user-uploads'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;
