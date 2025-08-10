"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Simple in-memory cache for user authentication to avoid repeated calls
let userCache: { user: any; timestamp: number } | null = null
const CACHE_DURATION = 120000 // 2 minutes

async function handleSupabaseRequest<T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> {
  try {
    return await requestFn()
  } catch (error: any) {
    if (error instanceof SyntaxError && error.message.includes("Unexpected token") && retryCount < 3) {
      console.log(`Rate limit detected, waiting ${(retryCount + 1) * 3} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 3000))
      return handleSupabaseRequest(requestFn, retryCount + 1)
    }
    throw error
  }
}

async function getCurrentUser() {
  try {
    // Check cache first
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      console.log("Using cached user data")
      return userCache.user
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()

      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        return null
      }

      if (!user) {
        console.error("No user found")
        return null
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Profile error:", profileError)
        return null
      }

      if (!profile) {
        console.error("No profile found for user:", user.id)
        return null
      }

      console.log("User authenticated successfully, role:", profile.role)
      return profile
    })

    if (result) {
      // Cache the successful result
      userCache = { user: result, timestamp: Date.now() }
    }

    return result
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

export async function getAdminStats() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()

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
    })

    return result
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
  }
}

export async function getAllUsers() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })

    return result
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getAllForums() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { data: forums, error } = await supabase
        .from("forums")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const forumsWithOwners = []
      for (const forum of forums || []) {
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
          const { data: owner } = await supabase
            .from("profiles")
            .select("username, display_name")
            .eq("id", forum.owner_id)
            .single()

          forumsWithOwners.push({
            ...forum,
            owner_username: owner?.username || "Unknown",
          })
        } catch (ownerError) {
          forumsWithOwners.push({
            ...forum,
            owner_username: "Unknown",
          })
        }
      }

      return forumsWithOwners
    })

    return result
  } catch (error) {
    console.error("Error getting all forums:", error)
    throw error
  }
}

export async function getAllReports() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const reportsWithDetails = []
      for (const report of reports || []) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        try {
          const reportWithDetails: any = { ...report }

          if (report.post_id) {
            const { data: post } = await supabase
              .from("posts")
              .select("title, content, author_id, forum_id")
              .eq("id", report.post_id)
              .single()
            reportWithDetails.post_title = post?.title || "Unknown Post"
            if (post?.forum_id) {
              const { data: forum } = await supabase.from("forums").select("subdomain").eq("id", post.forum_id).single()
              reportWithDetails.forum_subdomain = forum?.subdomain
            }
          } else if (report.comment_id) {
            const { data: comment } = await supabase
              .from("comments")
              .select("content, author_id, post_id")
              .eq("id", report.comment_id)
              .single()
            reportWithDetails.comment_content = comment?.content || "Unknown Comment"
            if (comment?.post_id) {
              const { data: post } = await supabase
                .from("posts")
                .select("id, forum_id")
                .eq("id", comment.post_id)
                .single()
              reportWithDetails.post_id = post?.id
              if (post?.forum_id) {
                const { data: forum } = await supabase
                  .from("forums")
                  .select("subdomain")
                  .eq("id", post.forum_id)
                  .single()
                reportWithDetails.forum_subdomain = forum?.subdomain
              }
            }
          }

          if (report.reporter_id) {
            const { data: reporter } = await supabase
              .from("profiles")
              .select("username, display_name")
              .eq("id", report.reporter_id)
              .single()
            reportWithDetails.reporter_username = reporter?.username || "Unknown"
          }

          if (report.reviewed_by) {
            const { data: reviewer } = await supabase
              .from("profiles")
              .select("username, display_name")
              .eq("id", report.reviewed_by)
              .single()
            reportWithDetails.reviewer_username = reviewer?.username || "Unknown"
          }

          reportsWithDetails.push(reportWithDetails)
        } catch (detailError) {
          reportsWithDetails.push(report)
        }
      }
      return reportsWithDetails
    })
    return result
  } catch (error) {
    console.error("Error getting all reports:", error)
    throw error
  }
}

export async function getAllPosts() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey(username, display_name),
          forum:forums!posts_forum_id_fkey(name, subdomain)
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    })

    return result
  } catch (error) {
    console.error("Error getting all posts:", error)
    throw error
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("posts").update({ status: "deleted" }).eq("id", postId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
      revalidatePath("/admin/posts")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

export async function restorePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("posts").update({ status: "published" }).eq("id", postId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
      revalidatePath("/admin/deleted")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error restoring post:", error)
    throw error
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: reason,
        })
        .eq("id", userId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

export async function unbanUser(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          ban_reason: null,
        })
        .eq("id", userId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: "Account deleted by admin",
        })
        .eq("id", userId)

      if (error) {
        console.error("Error deleting user:", error)
        throw error
      }

      console.log(`Successfully marked user ${userId} as deleted`)
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export async function suspendForum(forumId: string) {
  try {
    console.log("Attempting to suspend forum:", forumId)
    const user = await getCurrentUser()
    if (!user) {
      console.error("No user found in suspendForum")
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      console.error("User role is not admin:", user.role)
      throw new Error("Authentication required")
    }

    console.log("User authenticated for suspendForum, proceeding...")

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("forums").update({ status: "suspended" }).eq("id", forumId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 5000)

    return result
  } catch (error) {
    console.error("Error suspending forum:", error)
    throw error
  }
}

export async function activateForum(forumId: string) {
  try {
    console.log("Attempting to activate forum:", forumId)
    const user = await getCurrentUser()
    if (!user) {
      console.error("No user found in activateForum")
      throw new Error("Authentication required")
    }

    if (user.role !== "admin") {
      console.error("User role is not admin:", user.role)
      throw new Error("Authentication required")
    }

    console.log("User authenticated for activateForum, proceeding...")

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("forums").update({ status: "active" }).eq("id", forumId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 5000)

    return result
  } catch (error) {
    console.error("Error activating forum:", error)
    throw error
  }
}

export async function deleteForum(forumId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("forums").update({ status: "inactive" }).eq("id", forumId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error deleting forum:", error)
    throw error
  }
}

export async function resolveReport(reportId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
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
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error resolving report:", error)
    throw error
  }
}

export async function dismissReport(reportId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
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
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error dismissing report:", error)
    throw error
  }
}

export async function promoteToAdmin(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error promoting user to admin:", error)
    throw error
  }
}

export async function promoteToModerator(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("profiles").update({ role: "moderator" }).eq("id", userId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error promoting user to moderator:", error)
    throw error
  }
}

export async function demoteToUser(userId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Authentication required")
    }

    const result = await handleSupabaseRequest(async () => {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from("profiles").update({ role: "user" }).eq("id", userId)

      if (error) throw error
      return { success: true }
    })

    // Delay revalidation to prevent session issues
    setTimeout(() => {
      revalidatePath("/admin")
    }, 3000)

    return result
  } catch (error) {
    console.error("Error demoting user:", error)
    throw error
  }
}
