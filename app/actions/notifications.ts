'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  message: string
  relatedPostId?: string
  relatedCommentId?: string
  relatedForumId?: string
  relatedUserId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        related_post_id: params.relatedPostId || null,
        related_comment_id: params.relatedCommentId || null,
        related_forum_id: params.relatedForumId || null,
        related_user_id: params.relatedUserId || null,
        is_read: false,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Database error creating notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Create notification error:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

export async function getNotifications() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required', notifications: [] }
    }

    const supabase = await createServerSupabaseClient()
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:profiles!notifications_related_user_id_fkey(username, avatar_url),
        related_post:posts!notifications_related_post_id_fkey(title),
        related_forum:forums!notifications_related_forum_id_fkey(name, subdomain)
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Get notifications error:', error)
      return { success: false, error: error.message, notifications: [] }
    }

    return { success: true, notifications: notifications || [] }
  } catch (error) {
    console.error('Get notifications error:', error)
    return { success: false, error: 'Failed to fetch notifications', notifications: [] }
  }
}

export async function getUnreadNotificationCount() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return 0
    }

    const supabase = await createServerSupabaseClient()
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)

    if (error) {
      console.error('Get unread count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Get unread count error:', error)
    return 0
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required' }
    }

    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', currentUser.id)

    if (error) {
      console.error('Mark notification as read error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required' }
    }

    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)

    if (error) {
      console.error('Mark all notifications as read error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}
