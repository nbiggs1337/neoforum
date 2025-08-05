-- This script creates sample data for the forum
-- Run this after creating tables, policies, and functions

DO $$
DECLARE
    admin_user_id UUID;
    sample_forum_id UUID;
    sample_post_id UUID;
BEGIN
    -- Check if we have any users in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create a user account first.';
        RETURN;
    END IF;
    
    -- Ensure the user has a profile
    PERFORM public.ensure_user_profile(admin_user_id);
    
    -- Make the first user an admin
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = admin_user_id;
    
    -- Create sample forums
    INSERT INTO public.forums (id, name, subdomain, description, category, owner_id, status, member_count, post_count, thread_count)
    VALUES 
        (gen_random_uuid(), 'CyberTech Hub', 'cybertech', 'Discussing the latest in cybersecurity and technology', 'Technology', admin_user_id, 'active', 1, 0, 0),
        (gen_random_uuid(), 'Neon Gaming', 'neongaming', 'Gaming community for cyberpunk enthusiasts', 'Gaming', admin_user_id, 'active', 1, 0, 0),
        (gen_random_uuid(), 'Digital Art Collective', 'digitalart', 'Showcase and discuss digital art and design', 'Art & Design', admin_user_id, 'active', 1, 0, 0),
        (gen_random_uuid(), 'Future Finance', 'futurefinance', 'Cryptocurrency, fintech, and future of money', 'Finance', admin_user_id, 'active', 1, 0, 0),
        (gen_random_uuid(), 'Code Warriors', 'codewarriors', 'Programming challenges and discussions', 'Programming', admin_user_id, 'active', 1, 0, 0)
    ON CONFLICT (subdomain) DO NOTHING;
    
    -- Get a sample forum ID for creating posts
    SELECT id INTO sample_forum_id 
    FROM public.forums 
    WHERE subdomain = 'cybertech' 
    LIMIT 1;
    
    IF sample_forum_id IS NOT NULL THEN
        -- Create sample posts
        INSERT INTO public.posts (id, title, content, author_id, forum_id, status, upvotes, downvotes, view_count)
        VALUES 
            (gen_random_uuid(), 'Welcome to CyberTech Hub!', 'This is our community for discussing the latest in cybersecurity and technology. Feel free to share your thoughts, ask questions, and connect with fellow tech enthusiasts!', admin_user_id, sample_forum_id, 'published', 5, 0, 42),
            (gen_random_uuid(), 'Latest Cybersecurity Trends 2024', 'What are the most important cybersecurity trends we should be watching this year? I''m particularly interested in AI-powered security tools and zero-trust architecture.', admin_user_id, sample_forum_id, 'published', 3, 0, 28),
            (gen_random_uuid(), 'Best Practices for Secure Coding', 'Let''s discuss the essential secure coding practices every developer should know. What are your go-to security measures when writing code?', admin_user_id, sample_forum_id, 'published', 7, 1, 35)
        ON CONFLICT DO NOTHING;
        
        -- Get a sample post ID for creating comments
        SELECT id INTO sample_post_id 
        FROM public.posts 
        WHERE forum_id = sample_forum_id 
        LIMIT 1;
        
        IF sample_post_id IS NOT NULL THEN
            -- Create sample comments
            INSERT INTO public.posts (id, title, content, author_id, forum_id, parent_id, status, upvotes, downvotes)
            VALUES 
                (gen_random_uuid(), '', 'Great initiative! Looking forward to engaging discussions here.', admin_user_id, sample_forum_id, sample_post_id, 'published', 2, 0),
                (gen_random_uuid(), '', 'Thanks for creating this space. The cybersecurity community needs more places like this.', admin_user_id, sample_forum_id, sample_post_id, 'published', 1, 0)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RAISE NOTICE 'Sample data created successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;
