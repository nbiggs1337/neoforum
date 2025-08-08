-- Create a simple function to get forum by subdomain
CREATE OR REPLACE FUNCTION get_forum_by_subdomain(subdomain_param text)
RETURNS TABLE (
  id uuid,
  name text,
  subdomain text,
  description text,
  category text,
  owner_id uuid,
  status text,
  member_count integer,
  post_count integer,
  thread_count integer,
  is_private boolean,
  rules text,
  banner_url text,
  icon_url text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.subdomain,
    f.description,
    f.category,
    f.owner_id,
    f.status,
    f.member_count,
    f.post_count,
    f.thread_count,
    f.is_private,
    f.rules,
    f.banner_url,
    f.icon_url,
    f.created_at,
    f.updated_at
  FROM forums f
  WHERE f.subdomain = subdomain_param
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
