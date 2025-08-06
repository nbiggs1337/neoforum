"use server"

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

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
      supabase.from("profiles").select("id, created_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("forums").select("id").eq("status", "active").limit(1000),
      supabase.from("posts").select("id, created_at").eq("status", "published").limit(1000),
      supabase.from("reports").select("id").eq("status", "pending").limit(1000),
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
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))

    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return users || []
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getAllForums() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))

    // Get forums with limit to prevent "Too Many Requests" error
    const { data: forums, error: forumsError } = await supabase
      .from("forums")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (forumsError) throw forumsError

    // Get owner usernames with rate limiting
    const forumsWithOwners = []
    for (const forum of forums || []) {
      try {
        await new Promise(resolve => setTimeout(resolve, 50))
        
        const { data: owner } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", forum.owner_id)
          .single()

        forumsWithOwners.push({
          ...forum,
          owner_username: owner?.username || "Unknown",
        })
      } catch (error) {
        console.error(`Error fetching owner for forum ${forum.id}:`, error)
        forumsWithOwners.push({
          ...forum,
          owner_username: "Unknown",
        })
      }
    }

    return forumsWithOwners
  } catch (error) {
    console.error("Error getting all forums:", error)
    throw error
  }
}

export async function getAllReports() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))

    // Get reports with limit to prevent rate limiting
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25)

    if (reportsError) throw reportsError

    // Get related data with rate limiting
    const reportsWithDetails = []
    for (const report of reports || []) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))

        const reporter = report.reporter_id
          ? await supabase.from("profiles").select("username").eq("id", report.reporter_id).single()
          : { data: null }

        await new Promise(resolve => setTimeout(resolve, 50))

        const post = report.post_id
          ? await supabase.from("posts").select("title, forum_id").eq("id", report.post_id).single()
          : { data: null }

        // Get forum name if post exists
        let forum = { data: null }
        if (post.data?.forum_id) {
          await new Promise(resolve => setTimeout(resolve, 50))
          forum = await supabase.from("forums").select("name").eq("id", post.data.forum_id).single()
        }

        reportsWithDetails.push({
          ...report,
          reporter_username: reporter.data?.username || "Unknown",
          reported_user_username: "Unknown", // Not used for post reports
          post_title: post.data?.title || "Unknown",
          forum_name: forum.data?.name || "Unknown",
        })
      } catch (error) {
        console.error(`Error fetching details for report ${report.id}:`, error)
        reportsWithDetails.push({
          ...report,
          reporter_username: "Unknown",
          reported_user_username: "Unknown",
          post_title: "Unknown",
          forum_name: "Unknown",
        })
      }
    }

    return reportsWithDetails
  } catch (error) {
    console.error("Error getting all reports:", error)
    throw error
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // Calculate ban expiry (30 days from now)
    const banUntil = new Date()
    banUntil.setDate(banUntil.getDate() + 30)

    // Update user profile with ban information
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: true,
        banned_until: banUntil.toISOString(),
        ban_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error banning user:", error)
      throw error
    }

    console.log(`Successfully banned user ${userId} until ${banUntil.toISOString()} for reason: ${reason}`)
    return { success: true }
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

export async function unbanUser(userId: string) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    // Remove ban from user profile
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: false,
        banned_until: null,
        ban_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error unbanning user:", error)
      throw error
    }

    console.log(`Successfully unbanned user ${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error unbanning user:", error)
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

    // Use service role client for admin operations
    const serviceSupabase = await createServiceRoleSupabaseClient()

    // Delete the user from Supabase Auth (this will cascade delete the profile)
    const { error: deleteError } = await serviceSupabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted user ${userId} from auth and database`)
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
    
    if (!user) {
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error resolving report:", error)
    throw error
  }
}

export async function dismissReport(reportId: string) {
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
      .from("reports")
      .update({
        status: "dismissed",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error dismissing report:", error)
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
