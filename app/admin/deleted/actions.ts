"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getDeletedPosts() {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    throw new Error("Authentication required")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Get all deleted posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "deleted")
      .order("updated_at", { ascending: false })

    if (postsError) throw postsError

    // Get author and forum information for each post
    const postsWithDetails = await Promise.all(
      (posts || []).map(async (post) => {
        const [author, forum] = await Promise.all([
          supabase.from("users").select("username").eq("id", post.author_id).single(),
          supabase.from("forums").select("name, subdomain").eq("id", post.forum_id).single(),
        ])

        return {
          ...post,
          author_username: author?.data?.username || "Unknown",
          forum_name: forum?.data?.name || "Unknown",
          forum_subdomain: forum?.data?.subdomain || "unknown",
        }
      }),
    )

    return postsWithDetails
  } catch (error) {
    console.error("Get deleted posts error:", error)
    throw new Error("Failed to fetch deleted posts")
  }
}

export async function restorePost(postId: string) {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    throw new Error("Authentication required")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (error) throw error

    revalidatePath("/admin/posts")
    revalidatePath("/admin/deleted")
  } catch (error) {
    console.error("Restore post error:", error)
    throw new Error("Failed to restore post")
  }
}

export async function permanentlyDeletePost(postId: string) {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    throw new Error("Authentication required")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  try {
    // Delete post votes first
    await supabase.from("post_votes").delete().eq("post_id", postId)

    // Delete the post permanently
    const { error } = await supabase.from("posts").delete().eq("id", postId)

    if (error) throw error

    revalidatePath("/admin/posts")
    revalidatePath("/admin/deleted")
  } catch (error) {
    console.error("Permanently delete post error:", error)
    throw new Error("Failed to permanently delete post")
  }
}
