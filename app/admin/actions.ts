'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function getAllUsers() {
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting all users:', error)
    throw error
  }
}

export async function getAllForums() {
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { data: forums, error } = await supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const forumsWithOwners = []
    for (const forum of forums || []) {
      await new Promise(resolve => setTimeout(resolve, 50))
      
      try {
        const { data: owner } = await supabase
          .from('users')
          .select('username, display_name')
          .eq('id', forum.owner_id)
          .single()

        forumsWithOwners.push({
          ...forum,
          owner: owner || { username: 'Unknown', display_name: 'Unknown' }
        })
      } catch (ownerError) {
        forumsWithOwners.push({
          ...forum,
          owner: { username: 'Unknown', display_name: 'Unknown' }
        })
      }
    }

    return forumsWithOwners
  } catch (error) {
    console.error('Error getting all forums:', error)
    throw error
  }
}

export async function getAllReports() {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25)

    if (error) throw error

    const reportsWithDetails = []
    for (const report of reports || []) {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        const reportWithDetails = { ...report }

        if (report.post_id) {
          const { data: post } = await supabase
            .from('posts')
            .select('title, content, author_id')
            .eq('id', report.post_id)
            .single()
          reportWithDetails.post = post
        }

        if (report.reporter_id) {
          const { data: reporter } = await supabase
            .from('users')
            .select('username, display_name')
            .eq('id', report.reporter_id)
            .single()
          reportWithDetails.reporter = reporter
        }

        if (report.reviewed_by) {
          const { data: reviewer } = await supabase
            .from('users')
            .select('username, display_name')
            .eq('id', report.reviewed_by)
            .single()
          reportWithDetails.reviewer = reviewer
        }

        reportsWithDetails.push(reportWithDetails)
      } catch (detailError) {
        reportsWithDetails.push(report)
      }
    }

    return reportsWithDetails
  } catch (error) {
    console.error('Error getting all reports:', error)
    throw error
  }
}

export async function getAllPosts() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(username, display_name),
        forum:forums!posts_forum_id_fkey(name, subdomain)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting all posts:', error)
    throw error
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('posts')
      .update({ status: 'deleted' })
      .eq('id', postId)

    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/admin/posts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

export async function restorePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId)

    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/admin/deleted')
    return { success: true }
  } catch (error) {
    console.error('Error restoring post:', error)
    throw error
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('users')
      .update({ 
        is_banned: true, 
        ban_reason: reason 
      })
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error banning user:', error)
    throw error
  }
}

export async function unbanUser(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('users')
      .update({ 
        is_banned: false, 
        ban_reason: null 
      })
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error unbanning user:', error)
    throw error
  }
}

export async function resolveReport(reportId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('reports')
      .update({ 
        status: 'resolved',
        reviewed_by: user.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error resolving report:', error)
    throw error
  }
}

export async function dismissReport(reportId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Authentication required')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('reports')
      .update({ 
        status: 'dismissed',
        reviewed_by: user.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error dismissing report:', error)
    throw error
  }
}
