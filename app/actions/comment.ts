'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function createComment(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const postId = formData.get('postId') as string
    const content = formData.get('content') as string
    const parentId = formData.get('parentId') as string | null

    if (!postId || !content?.trim()) {
      throw new Error('Post ID and content are required')
    }

    const supabase = await createServerSupabaseClient()

    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('title, author_id, forum_id')
      .eq('id', postId)
      .single()

    if (!post) {
      throw new Error('Post not found')
    }

    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        author_id: user.id,
        post_id: postId,
        parent_id: parentId || null,
      })
      .select()
      .single()

    if (commentError) {
      console.error('Error creating comment:', commentError)
      throw new Error('Failed to create comment')
    }

    // Update post comment count
    const { error: updateError } = await supabase.rpc('increment_comment_count', {
      post_id: postId
    })

    if (updateError) {
      console.error('Error updating comment count:', updateError)
      // Try manual update as fallback
      const { data: currentPost } = await supabase
        .from('posts')
        .select('comment_count')
        .eq('id', postId)
        .single()

      const newCount = (currentPost?.comment_count || 0) + 1
      
      await supabase
        .from('posts')
        .update({ comment_count: newCount })
        .eq('id', postId)
    }

    // Create notification for post author (if not commenting on own post)
    if (post.author_id !== user.id) {
      try {
        await createNotification({
          userId: post.author_id,
          type: 'comment_on_post',
          title: 'New comment on your post',
          message: `${user.username} commented on "${post.title}"`,
          relatedPostId: postId,
          relatedCommentId: comment.id,
          relatedForumId: post.forum_id,
          relatedUserId: user.id
        })
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Don't fail the comment creation if notification fails
      }
    }

    // If this is a reply, create notification for parent comment author
    if (parentId) {
      try {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('author_id')
          .eq('id', parentId)
          .single()

        if (parentComment && parentComment.author_id !== user.id) {
          await createNotification({
            userId: parentComment.author_id,
            type: 'reply_to_comment',
            title: 'New reply to your comment',
            message: `${user.username} replied to your comment on "${post.title}"`,
            relatedPostId: postId,
            relatedCommentId: comment.id,
            relatedForumId: post.forum_id,
            relatedUserId: user.id
          })
        }
      } catch (notificationError) {
        console.error('Error creating reply notification:', notificationError)
        // Don't fail the comment creation if notification fails
      }
    }

    // Handle @mentions in the comment content
    const mentionRegex = /@(\w+)/g
    const mentions = content.match(mentionRegex)
    
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1) // Remove the @ symbol
        
        try {
          // Find the mentioned user
          const { data: mentionedUser } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('username', username)
            .single()

          if (mentionedUser && mentionedUser.id !== user.id) {
            await createNotification({
              userId: mentionedUser.id,
              type: 'mention_in_comment',
              title: 'You were mentioned in a comment',
              message: `${user.username} mentioned you in a comment on "${post.title}"`,
              relatedPostId: postId,
              relatedCommentId: comment.id,
              relatedForumId: post.forum_id,
              relatedUserId: user.id
            })
          }
        } catch (mentionError) {
          console.error('Error creating mention notification:', mentionError)
          // Don't fail the comment creation if mention notification fails
        }
      }
    }

    revalidatePath(`/forum/[subdomain]/post/[postId]`, 'page')
    return { success: true, comment }
  } catch (error) {
    console.error('Error in createComment:', error)
    throw error
  }
}

export async function deleteComment(commentId: string) {
try {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

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
