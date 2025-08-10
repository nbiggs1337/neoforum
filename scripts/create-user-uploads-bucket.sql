-- Create the 'user-uploads' bucket if it doesn't exist and make it public
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', true)
on conflict (id) do nothing;
