'use server'

import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function voteOnPost(postId: string, voteType: 1 | -1) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "Not authenticated" }
    }

    const supabase = await createServerSupabaseClient()

    // Get post details for notification
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        author_id,
        forum_id,
        forums!inner(subdomain, name)
      `)
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return { success: false, error: "Post not found" }
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", currentUser.id)
      .single()

    let shouldNotify = false

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase
          .from("post_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)
      } else {
        // Update vote
        await supabase
          .from("post_votes")
          .update({ vote_type: voteType })
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)
        
        shouldNotify = voteType === 1 // Only notify for upvotes
      }
    } else {
      // Create new vote
      await supabase
        .from("post_votes")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          vote_type: voteType,
        })
      
      shouldNotify = voteType === 1 // Only notify for upvotes
    }

    // Create notification for upvotes (not downvotes)
    if (shouldNotify && post.author_id !== currentUser.id) {
      await createNotification(
        post.author_id,
        'post_like',
        'Someone liked your post',
        `${currentUser.username} upvoted your post "${post.title}"`,
        postId,
        undefined,
        post.forum_id,
        currentUser.id
      )
    }

    // Update post vote counts
    await supabase.rpc('update_post_vote_counts', { post_id: postId })

    revalidatePath(`/forum/${post.forums.subdomain}/post/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Vote on post error:", error)
    return { success: false, error: "Failed to vote on post" }
  }
}
