"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function voteOnComment(commentId: string, vote: 'upvote' | 'downvote' | null) {
  console.log("=== COMMENT VOTE ACTION START ===")
  console.log("Comment ID:", commentId, "Vote:", vote)

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      console.log("No current user")
      return { success: false, error: 'Authentication required' }
    }

    console.log("Current user:", currentUser.id)

    const supabase = await createServerSupabaseClient()

    // Get comment details for notification
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select(`
        *,
        post:posts(id, title, author_id),
        author:profiles!comments_author_id_fkey(id, username, display_name)
      `)
      .eq('id', commentId)
      .single()

    if (commentError || !comment) {
      console.error('Comment fetch error:', commentError)
      return { success: false, error: 'Comment not found' }
    }

    console.log("Comment found:", comment.id)

    // Convert vote to numeric value
    const voteValue = vote === 'upvote' ? 1 : vote === 'downvote' ? -1 : null

    console.log("Vote value:", voteValue)

    // Check if user has already voted on this comment
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .single()

    if (existingVoteError && existingVoteError.code !== "PGRST116") {
      console.error("Error checking existing vote:", existingVoteError)
      return { success: false, error: "Failed to check existing vote" }
    }

    console.log("Existing vote:", existingVote)

    let userVote = null

    if (existingVote) {
      if (existingVote.vote_type === voteValue) {
        // Remove vote if clicking same button
        console.log("Removing existing vote...")
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)

        if (deleteError) {
          console.error("Delete error:", deleteError)
          return { success: false, error: "Failed to remove vote" }
        }
        console.log("Vote removed successfully")
        userVote = null
      } else {
        // Update existing vote
        console.log("Updating existing vote...")
        const { error: updateError } = await supabase
          .from('comment_votes')
          .update({ vote_type: voteValue })
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)

        if (updateError) {
          console.error("Update error:", updateError)
          return { success: false, error: "Failed to update vote" }
        }
        console.log("Vote updated successfully")
        userVote = voteValue
      }
    } else if (voteValue !== null) {
      // Create new vote
      console.log("Creating new vote...")
      const { error: insertError } = await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: currentUser.id,
        vote_type: voteValue,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        return { success: false, error: "Failed to create vote" }
      }
      console.log("Vote created successfully")
      userVote = voteValue
    }

    // Count all votes for this comment
    console.log("Counting votes...")
    const { data: allVotes, error: votesError } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)

    if (votesError) {
      console.error("Error fetching votes:", votesError)
      return { success: false, error: "Failed to fetch votes" }
    }

    console.log("All votes data:", allVotes)

    const upvotes = allVotes?.filter((vote) => vote.vote_type === 1).length || 0
    const downvotes = allVotes?.filter((vote) => vote.vote_type === -1).length || 0

    console.log("Vote counts - Upvotes:", upvotes, "Downvotes:", downvotes)

    // Update comment vote counts
    console.log("Updating comment vote counts...")
    const { error: updateCommentError } = await supabase
      .from('comments')
      .update({
        upvotes: upvotes,
        downvotes: downvotes,
      })
      .eq('id', commentId)

    if (updateCommentError) {
      console.error("Error updating comment:", updateCommentError)
      return { success: false, error: "Failed to update comment vote counts" }
    }

    console.log("Comment vote counts updated successfully")

    // Create notification for upvotes (not for self-votes or downvotes)
    if (vote === 'upvote' && comment.author_id !== currentUser.id) {
      await createNotification({
        userId: comment.author_id,
        type: 'comment_like',
        title: 'Comment Liked',
        message: `${currentUser.username || 'Someone'} liked your comment`,
        relatedPostId: comment.post_id,
        relatedCommentId: commentId,
        relatedUserId: currentUser.id
      })
    }

    // Revalidate paths
    revalidatePath("/forum/[subdomain]/post/[postId]", "page")
    revalidatePath("/")

    console.log("=== COMMENT VOTE ACTION COMPLETE ===")

    return {
      success: true,
      upvotes,
      downvotes,
      userVote,
    }
  } catch (error) {
    console.error('Vote on comment error:', error)
    return { success: false, error: 'Failed to vote on comment' }
  }
}
