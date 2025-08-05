-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID from auth.users
INSERT INTO public.users (id, username, display_name, role, reputation) VALUES
('00000000-0000-0000-0000-000000000000', 'admin', 'System Admin', 'admin', 1000)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample categories for forums
INSERT INTO public.forums (name, subdomain, description, category, owner_id, status) VALUES
('NeoForum Support', 'support', 'Official support forum for NeoForum platform', 'Support', '00000000-0000-0000-0000-000000000000', 'active'),
('Feature Requests', 'features', 'Suggest new features and improvements', 'Development', '00000000-0000-0000-0000-000000000000', 'active'),
('General Discussion', 'general', 'General discussion about technology and cyberpunk culture', 'General', '00000000-0000-0000-0000-000000000000', 'active')
ON CONFLICT (subdomain) DO NOTHING;

-- Insert sample posts
INSERT INTO public.posts (title, content, author_id, forum_id, status) VALUES
('Welcome to NeoForum!', 'Welcome to the future of online communities. This is your official support forum where you can get help, report issues, and connect with other users.', '00000000-0000-0000-0000-000000000000', (SELECT id FROM public.forums WHERE subdomain = 'support'), 'published'),
('How to Create Your First Forum', 'Creating a forum on NeoForum is easy! Just follow these steps: 1. Sign up for an account, 2. Go to your dashboard, 3. Click "Create New Forum", 4. Fill in the details and you''re ready to go!', '00000000-0000-0000-0000-000000000000', (SELECT id FROM public.forums WHERE subdomain = 'support'), 'published'),
('Community Guidelines', 'Please read and follow our community guidelines to ensure a positive experience for everyone. Be respectful, stay on topic, and help build an awesome community!', '00000000-0000-0000-0000-000000000000', (SELECT id FROM public.forums WHERE subdomain = 'general'), 'published')
ON CONFLICT DO NOTHING;
