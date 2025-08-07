'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function createComment(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required' }
    }

    const postId = formData.get('postId') as string
    const content = formData.get('content') as string
    const parentId = formData.get('parentId') as string | null

    if (!postId || !content?.trim()) {
      return { success: false, error: 'Post ID and content are required' }
    }

    const supabase = await createServerSupabaseClient()

    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('title, author_id, forum_id')
      .eq('id', postId)
      .single()

    // Create the comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: currentUser.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create comment error:', error)
      return { success: false, error: error.message }
    }

    // Create notifications
    if (post) {
      // Notify post author if it's a top-level comment
      if (!parentId && post.author_id !== currentUser.id) {
        await createNotification({
          userId: post.author_id,
          type: 'comment_on_post',
          title: 'New comment on your post',
          message: `${currentUser.username || 'Someone'} commented on "${post.title}"`,
          relatedPostId: postId,
          relatedCommentId: comment.id,
          relatedForumId: post.forum_id,
          relatedUserId: currentUser.id
        })
      }

      // If it's a reply, notify the parent comment author
      if (parentId) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('author_id')
          .eq('id', parentId)
          .single()

        if (parentComment && parentComment.author_id !== currentUser.id) {
          await createNotification({
            userId: parentComment.author_id,
            type: 'reply_to_comment',
            title: 'New reply to your comment',
            message: `${currentUser.username || 'Someone'} replied to your comment`,
            relatedPostId: postId,
            relatedCommentId: comment.id,
            relatedForumId: post.forum_id,
            relatedUserId: currentUser.id
          })
        }
      }
    }

    revalidatePath(`/forum/[subdomain]/post/[postId]`, 'page')
    return { success: true, comment }
  } catch (error) {
    console.error('Create comment error:', error)
    return { success: false, error: 'Failed to create comment' }
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
