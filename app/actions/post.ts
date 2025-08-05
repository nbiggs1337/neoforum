"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function createPost(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const forumId = formData.get("forum_id") as string

  if (!title || !content || !forumId) {
    return { error: "Title, content, and forum are required" }
  }

  try {
    // Check if user is a member of the forum
    const { data: membership } = await supabase
      .from("forum_members")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You must be a member of this forum to post" }
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        author_id: user.id,
        forum_id: forumId,
        status: "published",
      })
      .select()
      .single()

    if (postError) {
      console.error("Post creation error:", postError)
      return { error: "Failed to create post" }
    }

    return { success: true, post }
  } catch (error) {
    console.error("Post creation error:", error)
    return { error: "An unexpected error occurred" }
  }
}
