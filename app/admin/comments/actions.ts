"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

export async function getAllComments() {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get all comments with related data
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })

    if (commentsError) throw commentsError

    // Get related data for each comment
    const commentsWithDetails = await Promise.all(
      (comments || []).map(async (comment) => {
        const [author, post] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", comment.author_id)
            .single(),
          supabase
            .from("posts")
            .select("title, forum_id, forums!posts_forum_id_fkey(name, subdomain)")
            .eq("id", comment.post_id)
            .single(),
        ])

        return {
          ...comment,
          author_username: author.data?.username || "Unknown",
          author_avatar: author.data?.avatar_url || null,
          post_title: post.data?.title || "Unknown",
          forum_name: post.data?.forums?.name || "Unknown",
          forum_subdomain: post.data?.forums?.subdomain || "unknown",
        }
      })
    )

    return commentsWithDetails
  } catch (error) {
    console.error("Error getting all comments:", error)
    throw error
  }
}

export async function deleteComment(commentId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get the comment to get post_id for updating count
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      throw new Error("Comment not found")
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (deleteError) throw deleteError

    // Update post comment count
    const { error: updateError } = await supabase.rpc("decrement_post_comment_count", {
      post_id: comment.post_id,
    })

    if (updateError) {
      console.error("Failed to update comment count:", updateError)
    }

    console.log(`Successfully deleted comment ${commentId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}
