"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { FORUM_CATEGORIES } from "@/lib/constants"

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30)
}

export async function createForum(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to create a forum" }
    }

    // Check if user profile exists, create if not
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

    if (!existingProfile) {
      // Create profile with username from email
      const username = user.email?.split("@")[0] || "user"
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        username: username,
        display_name: username,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Failed to create user profile" }
      }
    }

    const name = formData.get("name") as string
    const subdomain = formData.get("subdomain") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    if (!name || !subdomain || !category) {
      return { error: "Missing required fields" }
    }

    // Validate category
    if (!FORUM_CATEGORIES.includes(category)) {
      return { error: "Invalid category" }
    }

    // Check if subdomain is already taken
    const { data: existingForum } = await supabase
      .from("forums")
      .select("subdomain")
      .eq("subdomain", subdomain)
      .single()

    if (existingForum) {
      return { error: "Subdomain already taken" }
    }

    // Create the forum
    const { data: forum, error: forumError } = await supabase
      .from("forums")
      .insert({
        name,
        subdomain,
        description,
        category,
        owner_id: user.id,
        status: "active",
        is_private: false,
        member_count: 1,
        post_count: 0,
        thread_count: 0,
      })
      .select()
      .single()

    if (forumError) {
      console.error("Forum creation error:", forumError)
      return { error: "Failed to create forum" }
    }

    // Add the creator as a member
    const { error: memberError } = await supabase.from("forum_members").insert({
      forum_id: forum.id,
      user_id: user.id,
      role: "admin",
    })

    if (memberError) {
      console.error("Member creation error:", memberError)
      return { error: "Failed to add forum membership" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/explore")

    return { success: true, redirectTo: `/forum/${subdomain}` }
  } catch (error: any) {
    console.error("Create forum error:", error.message)
    return { error: error.message || "Failed to create forum" }
  }
}

export async function updateForumSettings(forumId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Check if user is owner or admin
    const { data: forum } = await supabase.from("forums").select("owner_id, subdomain").eq("id", forumId).single()

    if (!forum) {
      return { error: "Forum not found" }
    }

    const isOwner = forum.owner_id === user.id

    if (!isOwner) {
      const { data: membership } = await supabase
        .from("forum_members")
        .select("role")
        .eq("forum_id", forumId)
        .eq("user_id", user.id)
        .single()

      if (!membership || membership.role !== "admin") {
        return { error: "You do not have permission to update this forum" }
      }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const longDescription = formData.get("longDescription") as string
    const category = formData.get("category") as string

    if (!name || !category) {
      return { error: "Name and category are required" }
    }

    if (!FORUM_CATEGORIES.includes(category)) {
      return { error: "Invalid category" }
    }

    // Update forum
    const { error } = await supabase
      .from("forums")
      .update({
        name,
        description,
        long_description: longDescription,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", forumId)

    if (error) {
      console.error("Forum update error:", error)
      return { error: "Failed to update forum" }
    }

    revalidatePath(`/forum/${forum.subdomain}`)
    revalidatePath(`/forum/${forum.subdomain}/settings`)
    revalidatePath("/explore")

    return { success: true }
  } catch (error: any) {
    console.error("Update forum settings error:", error.message)
    return { error: error.message || "Failed to update forum settings" }
  }
}

export async function joinForum(forumId: string) {
  try {
    console.log("Join forum called with forumId:", forumId)
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("User from auth:", user?.id, "Error:", userError)

    if (userError || !user) {
      console.log("Authentication failed")
      return { error: "You must be logged in to join a forum" }
    }

    // Check if user profile exists, create if not
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    console.log("Profile check result:", existingProfile, "Error:", profileCheckError)

    if (!existingProfile && profileCheckError) {
      console.log("Creating profile for user:", user.id)
      const username = user.email?.split("@")[0] || "user"
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        username: username,
        display_name: username,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Failed to create user profile" }
      }
    }

    // Check if already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("forum_members")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .single()

    console.log("Member check result:", existingMember, "Error:", memberCheckError)

    if (existingMember) {
      console.log("User is already a member")
      return { error: "Already a member" }
    }

    // Add as member
    console.log("Adding user as member to forum:", forumId)
    const { error: memberError } = await supabase.from("forum_members").insert({
      forum_id: forumId,
      user_id: user.id,
      role: "member",
    })

    if (memberError) {
      console.error("Join forum error:", memberError)
      return { error: "Failed to join forum" }
    }

    // Update member count
    console.log("Updating member count for forum:", forumId)
    const { error: updateError } = await supabase.rpc("increment_forum_members", {
      target_forum_id: forumId,
    })

    if (updateError) {
      console.error("Failed to update member count:", updateError)
    }

    console.log("Successfully joined forum")
    revalidatePath("/explore")
    return { success: true }
  } catch (error: any) {
    console.error("Join forum error:", error.message)
    return { error: error.message || "Failed to join forum" }
  }
}

export async function leaveForum(forumId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in" }
    }

    // Check if user is forum owner
    const { data: forum } = await supabase.from("forums").select("owner_id").eq("id", forumId).single()

    if (forum?.owner_id === user.id) {
      return { error: "Forum owners cannot leave their own forum" }
    }

    // Remove membership
    const { error: memberError } = await supabase
      .from("forum_members")
      .delete()
      .eq("forum_id", forumId)
      .eq("user_id", user.id)

    if (memberError) {
      console.error("Leave forum error:", memberError)
      return { error: "Failed to leave forum" }
    }

    // Update member count
    const { error: updateError } = await supabase.rpc("decrement_forum_members", {
      target_forum_id: forumId,
    })

    if (updateError) {
      console.error("Failed to update member count:", updateError)
    }

    revalidatePath("/explore")
    return { success: true }
  } catch (error: any) {
    console.error("Leave forum error:", error.message)
    return { error: error.message || "Failed to leave forum" }
  }
}

export async function followForum(forumId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to follow a forum" }
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("forum_follows")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .single()

    if (existingFollow) {
      return { error: "Already following" }
    }

    // Add follow
    const { error } = await supabase.from("forum_follows").insert({
      forum_id: forumId,
      user_id: user.id,
    })

    if (error) {
      console.error("Follow forum error:", error)
      return { error: "Failed to follow forum" }
    }

    revalidatePath("/explore")
    return { success: true }
  } catch (error: any) {
    console.error("Follow forum error:", error.message)
    return { error: error.message || "Failed to follow forum" }
  }
}

export async function unfollowForum(forumId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in" }
    }

    // Remove follow
    const { error } = await supabase.from("forum_follows").delete().eq("forum_id", forumId).eq("user_id", user.id)

    if (error) {
      console.error("Unfollow forum error:", error)
    }

    revalidatePath("/explore")
    return { success: true }
  } catch (error: any) {
    console.error("Unfollow forum error:", error.message)
    return { error: error.message || "Failed to unfollow forum" }
  }
}

export async function createPost(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a post" }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const forumId = formData.get("forumId") as string

    if (!title || !content || !forumId) {
      return { error: "All fields are required" }
    }

    // Check if user is a member of the forum
    const { data: membership } = await supabase
      .from("forum_members")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You must be a member to post in this forum" }
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        forum_id: forumId,
        status: "published",
      })
      .select()
      .single()

    if (postError) {
      console.error("Post creation error:", postError)
      return { error: "Failed to create post" }
    }

    // Update forum post count
    const { error: updateError } = await supabase.rpc("increment_forum_posts", {
      target_forum_id: forumId,
    })

    if (updateError) {
      console.error("Failed to update post count:", updateError)
    }

    revalidatePath("/forum/[subdomain]", "page")
    return { success: true, postId: post.id }
  } catch (error: any) {
    console.error("Create post error:", error)
    return { error: error.message || "Authentication required" }
  }
}
