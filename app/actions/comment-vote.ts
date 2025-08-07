"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function voteOnComment(commentId: string, vote: 'upvote' | 'downvote' | null) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required' }
    }

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

    // Convert vote to numeric value
    const voteValue = vote === 'upvote' ? 1 : vote === 'downvote' ? -1 : 0

    // Check if user has already voted on this comment
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .single()

    let operation = 'insert'
    let oldVoteValue = 0

    if (existingVote) {
      oldVoteValue = existingVote.vote_type
      if (voteValue === 0) {
        // Remove vote
        operation = 'delete'
      } else {
        // Update vote
        operation = 'update'
      }
    }

    // Perform the vote operation
    if (operation === 'delete') {
      const { error: deleteError } = await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', currentUser.id)

      if (deleteError) {
        console.error('Delete vote error:', deleteError)
        return { success: false, error: 'Failed to remove vote' }
      }
    } else if (operation === 'update') {
      const { error: updateError } = await supabase
        .from('comment_votes')
        .update({ vote_type: voteValue })
        .eq('comment_id', commentId)
        .eq('user_id', currentUser.id)

      if (updateError) {
        console.error('Update vote error:', updateError)
        return { success: false, error: 'Failed to update vote' }
      }
    } else {
      // Insert new vote
      const { error: insertError } = await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          user_id: currentUser.id,
          vote_type: voteValue
        })

      if (insertError) {
        console.error('Insert vote error:', insertError)
        return { success: false, error: 'Failed to add vote' }
      }
    }

    // Update comment vote counts manually instead of using the function
    const { data: allVotes, error: votesError } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)

    if (!votesError && allVotes) {
      const upvotes = allVotes.filter(v => v.vote_type === 1).length
      const downvotes = allVotes.filter(v => v.vote_type === -1).length

      const { error: updateCommentError } = await supabase
        .from('comments')
        .update({
          upvotes: upvotes,
          downvotes: downvotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (updateCommentError) {
        console.error('Update comment vote count error:', updateCommentError)
      }
    }

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

    // Revalidate the post page
    if (comment.post) {
      revalidatePath(`/forum/*/post/${comment.post.id}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Vote on comment error:', error)
    return { success: false, error: 'Failed to vote on comment' }
  }
}
