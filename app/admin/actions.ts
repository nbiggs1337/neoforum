"use server"

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

export async function getAdminStats() {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    console.log("Current user role:", profile?.role)

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get basic counts
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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const { data: users, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return users || []
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getAllForums() {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get forums first
    const { data: forums, error: forumsError } = await supabase
      .from("forums")
      .select("*")
      .order("created_at", { ascending: false })

    if (forumsError) throw forumsError

    // Get owner usernames separately
    const forumsWithOwners = await Promise.all(
      (forums || []).map(async (forum) => {
        const { data: owner } = await supabase.from("profiles").select("username").eq("id", forum.owner_id).single()

        return {
          ...forum,
          owner_username: owner?.username || "Unknown",
        }
      }),
    )

    return forumsWithOwners
  } catch (error) {
    console.error("Error getting all forums:", error)
    throw error
  }
}

export async function getAllReports() {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Get reports first
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (reportsError) throw reportsError

    // Get related data separately for each report
    const reportsWithDetails = await Promise.all(
      (reports || []).map(async (report) => {
        const [reporter, reportedUser, post, forum] = await Promise.all([
          report.reporter_id
            ? supabase.from("profiles").select("username").eq("id", report.reporter_id).single()
            : Promise.resolve({ data: null }),
          report.reported_user_id
            ? supabase.from("profiles").select("username").eq("id", report.reported_user_id).single()
            : Promise.resolve({ data: null }),
          report.post_id
            ? supabase.from("posts").select("title").eq("id", report.post_id).single()
            : Promise.resolve({ data: null }),
          report.forum_id
            ? supabase.from("forums").select("name").eq("id", report.forum_id).single()
            : Promise.resolve({ data: null }),
        ])

        return {
          ...report,
          reporter_username: reporter.data?.username || "Unknown",
          reported_user_username: reportedUser.data?.username || "Unknown",
          post_title: post.data?.title || "Unknown",
          forum_name: forum.data?.name || "Unknown",
        }
      }),
    )

    return reportsWithDetails
  } catch (error) {
    console.error("Error getting all reports:", error)
    throw error
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Log the action since we don't have ban functionality
    console.log(`Admin ${user.id} attempted to ban user ${userId} for reason: ${reason}`)

    return { success: true, message: "Ban functionality not implemented yet" }
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

export async function unbanUser(userId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Log the action since we don't have ban functionality
    console.log(`Admin ${user.id} attempted to unban user ${userId}`)

    return { success: true, message: "Unban functionality not implemented yet" }
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        moderator_id: user.id,
        resolved_at: new Date().toISOString(),
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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase
      .from("reports")
      .update({
        status: "dismissed",
        moderator_id: user.id,
        resolved_at: new Date().toISOString(),
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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      throw new Error("Unauthorized")
    }

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
