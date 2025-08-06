'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('You must be logged in to create a post')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const subdomain = formData.get('subdomain') as string
  const postType = formData.get('postType') as string
  const imageUrlsString = formData.get('imageUrls') as string

  if (!title || !subdomain) {
    throw new Error('Title and forum are required')
  }

  // Parse image URLs if provided
  let imageUrls: string[] | null = null
  if (imageUrlsString) {
    try {
      imageUrls = JSON.parse(imageUrlsString)
    } catch (error) {
      console.error('Error parsing image URLs:', error)
      throw new Error('Invalid image data')
    }
  }

  // Get forum ID from subdomain
  const { data: forum, error: forumError } = await supabase
    .from('forums')
    .select('id')
    .eq('subdomain', subdomain)
    .single()

  if (forumError || !forum) {
    throw new Error('Forum not found')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  // Create the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      title,
      content: content || null,
      forum_id: forum.id,
      author_id: profile.id,
      image_urls: imageUrls
    })
    .select('id')
    .single()

  if (postError) {
    console.error('Error creating post:', postError)
    throw new Error('Failed to create post')
  }

  // Revalidate the forum page
  revalidatePath(`/forum/${subdomain}`)
  
  // Redirect to the new post
  redirect(`/forum/${subdomain}/post/${post.id}`)
}
