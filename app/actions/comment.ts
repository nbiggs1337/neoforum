"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createComment(formData: FormData) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const postId = formData.get("postId") as string
    const content = formData.get("content") as string
    const parentId = formData.get("parentId") as string | null

    if (!postId || !content?.trim()) {
      return { success: false, error: "Missing required fields" }
    }

    // Get the post to verify it exists and get forum info
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, forum_id, forums!posts_forum_id_fkey(subdomain)")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return { success: false, error: "Post not found" }
    }

    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        content: content.trim(),
        author_id: user.id,
        post_id: postId,
        parent_id: parentId || null,
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single()

    if (commentError) {
      console.error("Comment creation error:", commentError)
      return { success: false, error: "Failed to create comment" }
    }

    // Update post comment count
    const { error: updateError } = await supabase.rpc("increment_post_comment_count", {
      post_id: postId,
    })

    if (updateError) {
      console.error("Failed to update comment count:", updateError)
    }

    // Revalidate the post page
    revalidatePath(`/forum/${post.forums.subdomain}/post/${postId}`)

    return { success: true, comment }
  } catch (error) {
    console.error("Create comment error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Get the comment to verify ownership
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, author_id, post_id")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return { success: false, error: "Comment not found" }
    }

    // Check if user owns the comment or is admin
    if (comment.author_id !== user.id && user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    // Delete the comment (hard delete for now)
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId)

    if (deleteError) {
      console.error("Comment deletion error:", deleteError)
      return { success: false, error: "Failed to delete comment" }
    }

    // Update post comment count
    const { error: updateError } = await supabase.rpc("decrement_post_comment_count", {
      post_id: comment.post_id,
    })

    if (updateError) {
      console.error("Failed to update comment count:", updateError)
    }

    return { success: true }
  } catch (error) {
    console.error("Delete comment error:", error)
    return { success: false, error: "Internal server error" }
  }
}
