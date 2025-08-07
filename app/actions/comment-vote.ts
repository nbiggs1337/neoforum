'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function voteOnComment(commentId: string, voteType: 'upvote' | 'downvote' | null) {
  try {
    console.log(`Starting vote on comment ${commentId} with type:`, voteType)
    
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      console.log('No current user found')
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    // Convert vote type to numeric value
    const voteValue = voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : null
    console.log('Vote value:', voteValue)

    // Check for existing vote
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('comment_votes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError)
      return { success: false, error: 'Failed to check existing vote' }
    }

    console.log('Existing vote:', existingVote)

    // Handle vote logic
    if (existingVote) {
      if (voteValue === null) {
        // Remove vote
        console.log('Removing existing vote')
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)

        if (deleteError) {
          console.error('Error deleting vote:', deleteError)
          return { success: false, error: 'Failed to remove vote' }
        }
      } else {
        // Update existing vote
        console.log('Updating existing vote to:', voteValue)
        const { error: updateError } = await supabase
          .from('comment_votes')
          .update({ vote_type: voteValue })
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return { success: false, error: 'Failed to update vote' }
        }
      }
    } else if (voteValue !== null) {
      // Create new vote
      console.log('Creating new vote with value:', voteValue)
      const { error: insertError } = await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          user_id: currentUser.id,
          vote_type: voteValue
        })

      if (insertError) {
        console.error('Error creating vote:', insertError)
        return { success: false, error: 'Failed to create vote' }
      }
    }

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 100))

    // Count all votes for this comment with retry logic
    let upvotes = 0
    let downvotes = 0
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data: votes, error: countError } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', commentId)

        if (countError) {
          console.error(`Vote count error (attempt ${attempt + 1}):`, countError)
          if (attempt === 2) throw countError
          await new Promise(resolve => setTimeout(resolve, 50))
          continue
        }

        upvotes = votes?.filter(v => v.vote_type === 1).length || 0
        downvotes = votes?.filter(v => v.vote_type === -1).length || 0
        console.log(`Vote counts (attempt ${attempt + 1}): upvotes=${upvotes}, downvotes=${downvotes}`)
        break
      } catch (error) {
        if (attempt === 2) {
          console.error('Failed to count votes after 3 attempts:', error)
          return { success: false, error: 'Failed to count votes' }
        }
      }
    }

    // Update comment vote counts with retry logic
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { error: updateCommentError } = await supabase
          .from('comments')
          .update({ 
            upvotes: upvotes,
            downvotes: downvotes
          })
          .eq('id', commentId)

        if (updateCommentError) {
          console.error(`Comment update error (attempt ${attempt + 1}):`, updateCommentError)
          if (attempt === 2) throw updateCommentError
          await new Promise(resolve => setTimeout(resolve, 50))
          continue
        }

        console.log(`Comment updated successfully (attempt ${attempt + 1})`)
        break
      } catch (error) {
        if (attempt === 2) {
          console.error('Failed to update comment after 3 attempts:', error)
          return { success: false, error: 'Failed to update comment vote counts' }
        }
      }
    }

    // Verify the update worked
    const { data: updatedComment, error: verifyError } = await supabase
      .from('comments')
      .select('upvotes, downvotes, author_id')
      .eq('id', commentId)
      .single()

    if (verifyError) {
      console.error('Error verifying comment update:', verifyError)
    } else {
      console.log('Verified comment vote counts:', updatedComment)
      
      // Create notification for upvotes (not for the comment author voting on their own comment)
      if (voteType === 'upvote' && updatedComment.author_id !== currentUser.id) {
        try {
          await createNotification({
            userId: updatedComment.author_id,
            type: 'comment_like',
            title: 'Comment Liked',
            message: `${currentUser.username} liked your comment`,
            relatedCommentId: commentId,
            relatedUserId: currentUser.id
          })
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError)
          // Don't fail the vote operation if notification fails
        }
      }
    }

    // Revalidate the post page
    try {
      revalidatePath('/forum/[subdomain]/post/[postId]', 'page')
    } catch (revalidateError) {
      console.error('Error revalidating path:', revalidateError)
      // Don't fail the operation if revalidation fails
    }

    console.log('Vote operation completed successfully')
    return { 
      success: true, 
      upvotes: upvotes,
      downvotes: downvotes,
      userVote: voteValue
    }

  } catch (error) {
    console.error('Unexpected error in voteOnComment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
