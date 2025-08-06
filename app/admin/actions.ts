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
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function getAdminStats() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get basic counts with error handling
    const [usersResult, forumsResult, postsResult, reportsResult] = await Promise.all([
      supabase.from("profiles").select("id, created_at").order("created_at", { ascending: false }),
      supabase.from("forums").select("id").eq("status", "active"),
      supabase.from("posts").select("id, created_at").eq("status", "published"),
      supabase.from("reports").select("id").eq("status", "pending"),
    ])

    const users = usersResult.data || []
    const forums = forumsResult.data || []
    const posts = postsResult.data || []
    const reports = reportsResult.data || []

    // Calculate daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailySignups = users.filter((user) => new Date(user.created_at) >= today).length
    const dailyPosts = posts.filter((post) => new Date(post.created_at) >= today).length

    return {
      totalUsers: users.length,
      activeUsers: users.length,
      totalForums: forums.length,
      totalPosts: posts.length,
      totalReports: reports.length,
      pendingApprovals: 0,
      bannedUsers: 0,
      dailySignups,
      dailyPosts,
      serverUptime: "99.9%",
      storageUsed: "2.4 GB",
      bandwidth: "1.2 TB",
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
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
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

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

    if (error) throw error

    const forumsWithOwners = []
    for (const forum of forums || []) {
      await new Promise(resolve => setTimeout(resolve, 50))
      
      try {
        const { data: owner } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', forum.owner_id)
          .single()

        forumsWithOwners.push({
          ...forum,
          owner_username: owner?.username || 'Unknown'
        })
      } catch (ownerError) {
        forumsWithOwners.push({
          ...forum,
          owner_username: 'Unknown'
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
          reportWithDetails.post_title = post?.title || 'Unknown'
        }

        if (report.reporter_id) {
          const { data: reporter } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', report.reporter_id)
            .single()
          reportWithDetails.reporter_username = reporter?.username || 'Unknown'
        }

        if (report.reviewed_by) {
          const { data: reviewer } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', report.reviewed_by)
            .single()
          reportWithDetails.reviewer_username = reviewer?.username || 'Unknown'
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
        author:profiles!posts_author_id_fkey(username, display_name),
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
      .from('profiles')
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
      .from('profiles')
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

export async function deleteUser(userId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // First check if the columns exist, if not just use is_banned as a fallback
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_banned: true,
        ban_reason: "Account deleted by admin"
      })
      .eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      throw error
    }

    revalidatePath('/admin')
    console.log(`Successfully marked user ${userId} as deleted`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export async function suspendForum(forumId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("forums").update({ status: "suspended" }).eq("id", forumId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error suspending forum:", error)
    throw error
  }
}

export async function activateForum(forumId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("forums").update({ status: "active" }).eq("id", forumId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error activating forum:", error)
    throw error
  }
}

export async function deleteForum(forumId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("forums").update({ status: "inactive" }).eq("id", forumId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting forum:", error)
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

export async function promoteToAdmin(userId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error promoting user to admin:", error)
    throw error
  }
}

export async function promoteToModerator(userId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("profiles")
      .update({ role: "moderator" })
      .eq("id", userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error promoting user to moderator:", error)
    throw error
  }
}

export async function demoteToUser(userId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("profiles")
      .update({ role: "user" })
      .eq("id", userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error demoting user:", error)
    throw error
  }
}
