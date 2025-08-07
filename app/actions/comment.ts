'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export interface CreateNotificationParams {
  recipient_id: string
  type: 'comment_on_post' | 'reply_to_comment' | 'forum_join' | 'post_like' | 'comment_like'
  title: string
  message: string
  post_id?: string
  comment_id?: string
  forum_id?: string
}

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

    const supabase = createServerSupabaseClient()

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
          recipient_id: post.author_id,
          type: 'comment_on_post',
          title: 'New comment on your post',
          message: `${user.username} commented on "${post.title}"`,
          post_id: postId,
          comment_id: comment.id,
          forum_id: post.forum_id
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
            recipient_id: parentComment.author_id,
            type: 'reply_to_comment',
            title: 'New reply to your comment',
            message: `${user.username} replied to your comment on "${post.title}"`,
            post_id: postId,
            comment_id: comment.id,
            forum_id: post.forum_id
          })
        }
      } catch (notificationError) {
        console.error('Error creating reply notification:', notificationError)
        // Don't fail the comment creation if notification fails
      }
    }

    revalidatePath(`/forum/[subdomain]/post/[postId]`, 'page')
    return { success: true, comment }
  } catch (error) {
    console.error('Error in createComment:', error)
    throw error
  }
}
