"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to create a forum")
  }

  const name = formData.get("name") as string
  const subdomain = formData.get("subdomain") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string

  if (!name || !subdomain || !description || !category) {
    throw new Error("All fields are required")
  }

  // Validate category
  if (!FORUM_CATEGORIES.includes(category)) {
    throw new Error("Invalid category")
  }

  // Check if subdomain is already taken
  const { data: existingForum } = await supabase
    .from("forums")
    .select("id")
    .eq("subdomain", subdomain)
    .single()

  if (existingForum) {
    throw new Error("Subdomain is already taken")
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
      member_count: 1,
      post_count: 0,
      thread_count: 0,
      is_private: false,
    })
    .select()
    .single()

  if (forumError) {
    console.error("Forum creation error:", forumError)
    throw new Error("Failed to create forum")
  }

  // Add the creator as a member
  const { error: memberError } = await supabase.from("forum_members").insert({
    forum_id: forum.id,
    user_id: user.id,
    role: "admin",
  })

  if (memberError) {
    console.error("Member creation error:", memberError)
    // Don't throw error here, forum was created successfully
  }

  revalidatePath("/explore")
  redirect(`/forum/${subdomain}`)
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

    // Check if user is owner, admin, or moderator
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

      if (!membership || !["admin", "moderator"].includes(membership.role)) {
        return { error: "You do not have permission to update this forum" }
      }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const longDescription = formData.get("long_description") as string
    const category = formData.get("category") as string
    const rules = formData.get("rules") as string

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
        rules,
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

export async function addForumModerator(forumId: string, username: string, role: "moderator" | "admin") {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Check if current user is owner or admin
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
        return { error: "You do not have permission to add moderators" }
      }
    }

    // Find user by username
    const { data: targetUser, error: userFindError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", username.trim())
      .single()

    if (userFindError || !targetUser) {
      return { error: "User not found" }
    }

    // Check if user is already a member
    const { data: existingMembership, error: membershipError } = await supabase
      .from("forum_members")
      .select("id, role")
      .eq("forum_id", forumId)
      .eq("user_id", targetUser.id)
      .single()

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Error checking membership:", membershipError)
      return { error: "Failed to check user membership" }
    }

    if (existingMembership) {
      // Update existing membership
      const { error: updateError } = await supabase
        .from("forum_members")
        .update({ role })
        .eq("id", existingMembership.id)

      if (updateError) {
        console.error("Error updating membership:", updateError)
        return { error: "Failed to update user role" }
      }
    } else {
      // Add new membership
      const { error: insertError } = await supabase
        .from("forum_members")
        .insert({
          forum_id: forumId,
          user_id: targetUser.id,
          role,
        })

      if (insertError) {
        console.error("Error adding membership:", insertError)
        return { error: "Failed to add user as moderator" }
      }

      // Get current member count and increment it
      const { data: currentForum } = await supabase
        .from("forums")
        .select("member_count")
        .eq("id", forumId)
        .single()

      if (currentForum) {
        const newCount = (currentForum.member_count || 0) + 1
        const { error: updateCountError } = await supabase
          .from("forums")
          .update({
            member_count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", forumId)

        if (updateCountError) {
          console.error("Error updating member count:", updateCountError)
          // Don't return error here as the main operation was successful
        }
      }
    }

    revalidatePath(`/forum/${forum.subdomain}/settings`)
    return { success: true }
  } catch (error: any) {
    console.error("Add forum moderator error:", error.message)
    return { error: error.message || "Failed to add moderator" }
  }
}

export async function removeForumModerator(forumId: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Check if current user is owner or admin
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
        return { error: "You do not have permission to remove moderators" }
      }
    }

    // Cannot remove the forum owner
    if (userId === forum.owner_id) {
      return { error: "Cannot remove forum owner" }
    }

    // Remove moderator
    const { error: removeError } = await supabase
      .from("forum_members")
      .delete()
      .eq("forum_id", forumId)
      .eq("user_id", userId)

    if (removeError) {
      console.error("Error removing moderator:", removeError)
      return { error: "Failed to remove moderator" }
    }

    // Get current member count and decrement it
    const { data: currentForum } = await supabase
      .from("forums")
      .select("member_count")
      .eq("id", forumId)
      .single()

    if (currentForum) {
      const newCount = Math.max((currentForum.member_count || 0) - 1, 0)
      const { error: updateCountError } = await supabase
        .from("forums")
        .update({
          member_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", forumId)

      if (updateCountError) {
        console.error("Error updating member count:", updateCountError)
        // Don't return error here as the main operation was successful
      }
    }

    revalidatePath(`/forum/${forum.subdomain}/settings`)
    return { success: true }
  } catch (error: any) {
    console.error("Remove forum moderator error:", error.message)
    return { error: error.message || "Failed to remove moderator" }
  }
}

export async function updateModeratorRole(forumId: string, userId: string, newRole: "moderator" | "admin") {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Check if current user is owner or admin
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
        return { error: "You do not have permission to update moderator roles" }
      }
    }

    // Cannot change the forum owner's role
    if (userId === forum.owner_id) {
      return { error: "Cannot change forum owner's role" }
    }

    // Update moderator role
    const { error: updateError } = await supabase
      .from("forum_members")
      .update({ role: newRole })
      .eq("forum_id", forumId)
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating moderator role:", updateError)
      return { error: "Failed to update moderator role" }
    }

    revalidatePath(`/forum/${forum.subdomain}/settings`)
    return { success: true }
  } catch (error: any) {
    console.error("Update moderator role error:", error.message)
    return { error: error.message || "Failed to update moderator role" }
  }
}

export async function toggleForumPrivacy(forumId: string) {
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
    const { data: forum } = await supabase.from("forums").select("owner_id, subdomain, is_private").eq("id", forumId).single()

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
        return { error: "You do not have permission to change privacy settings" }
      }
    }

    // Toggle privacy
    const { error } = await supabase
      .from("forums")
      .update({
        is_private: !forum.is_private,
        updated_at: new Date().toISOString(),
      })
      .eq("id", forumId)

    if (error) {
      console.error("Forum privacy toggle error:", error)
      return { error: "Failed to update privacy settings" }
    }

    revalidatePath(`/forum/${forum.subdomain}`)
    revalidatePath(`/forum/${forum.subdomain}/settings`)
    revalidatePath("/explore")

    return { success: true, isPrivate: !forum.is_private }
  } catch (error: any) {
    console.error("Toggle forum privacy error:", error.message)
    return { error: error.message || "Failed to update privacy settings" }
  }
}

export async function uploadForumIcon(forumId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log("Starting forum icon upload for forum:", forumId)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return { error: "You must be logged in" }
    }

    console.log("User authenticated:", user.id)

    // Check if user has permission
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

      if (!membership || !["admin", "moderator"].includes(membership.role)) {
        return { error: "You do not have permission to upload forum icon" }
      }
    }

    const file = formData.get("icon") as File

    if (!file) {
      return { error: "No file provided" }
    }

    console.log("File details:", { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image" }
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "File size must be less than 2MB" }
    }

    // Create a simple filename without special characters
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `forum-${forumId}-icon-${Date.now()}.${fileExtension}`
    
    console.log("Uploading file as:", fileName)

    // Try to upload to storage with service role client
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("forum-images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return { error: `Failed to upload icon: ${uploadError.message}` }
    }

    console.log("Upload successful:", uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("forum-images")
      .getPublicUrl(fileName)

    console.log("Public URL:", publicUrl)

    // Update forum with icon URL
    const { error: updateError } = await supabase
      .from("forums")
      .update({
        icon_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", forumId)

    if (updateError) {
      console.error("Forum icon update error:", updateError)
      return { error: "Failed to update forum icon" }
    }

    console.log("Forum updated successfully")

    revalidatePath(`/forum/${forum.subdomain}`)
    revalidatePath(`/forum/${forum.subdomain}/settings`)

    return { success: true, iconUrl: publicUrl }
  } catch (error: any) {
    console.error("Upload forum icon error:", error)
    return { error: error.message || "Failed to upload forum icon" }
  }
}

export async function uploadForumBanner(forumId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log("Starting forum banner upload for forum:", forumId)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return { error: "You must be logged in" }
    }

    console.log("User authenticated:", user.id)

    // Check if user has permission
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

      if (!membership || !["admin", "moderator"].includes(membership.role)) {
        return { error: "You do not have permission to upload forum banner" }
      }
    }

    const file = formData.get("banner") as File

    if (!file) {
      return { error: "No file provided" }
    }

    console.log("File details:", { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image" }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size must be less than 5MB" }
    }

    // Create a simple filename without special characters
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `forum-${forumId}-banner-${Date.now()}.${fileExtension}`
    
    console.log("Uploading file as:", fileName)

    // Try to upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("forum-images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return { error: `Failed to upload banner: ${uploadError.message}` }
    }

    console.log("Upload successful:", uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("forum-images")
      .getPublicUrl(fileName)

    console.log("Public URL:", publicUrl)

    // Update forum with banner URL
    const { error: updateError } = await supabase
      .from("forums")
      .update({
        banner_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", forumId)

    if (updateError) {
      console.error("Forum banner update error:", updateError)
      return { error: "Failed to update forum banner" }
    }

    console.log("Forum updated successfully")

    revalidatePath(`/forum/${forum.subdomain}`)
    revalidatePath(`/forum/${forum.subdomain}/settings`)

    return { success: true, bannerUrl: publicUrl }
  } catch (error: any) {
    console.error("Upload forum banner error:", error)
    return { error: error.message || "Failed to upload forum banner" }
  }
}

export async function joinForum(forumId: string) {
  console.log("joinForum called with forumId:", forumId)
  
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check result:", { user: user?.id, error: authError })

    if (authError || !user) {
      console.log("Authentication failed")
      return { error: "Authentication required" }
    }

    // Check if user profile exists, create if not
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .limit(1)

    console.log("Profile check result:", { profile: existingProfile, error: profileCheckError })

    if (!existingProfile || existingProfile.length === 0) {
      console.log("Creating user profile...")
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User",
          role: "user",
        })

      if (createProfileError) {
        console.error("Failed to create profile:", createProfileError)
        return { error: "Failed to create user profile" }
      }
      console.log("Profile created successfully")
    }

    // Check if user is already a member
    const { data: existingMembership, error: membershipError } = await supabase
      .from("forum_members")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .limit(1)

    console.log("Membership check result:", { membership: existingMembership, error: membershipError })

    if (membershipError) {
      console.error("Error checking membership:", membershipError)
      return { error: "Failed to check membership status" }
    }

    if (existingMembership && existingMembership.length > 0) {
      console.log("User is already a member")
      return { error: "Already a member of this forum" }
    }

    // Add user to forum
    console.log("Adding user to forum...")
    const { error: joinError } = await supabase.from("forum_members").insert({
      forum_id: forumId,
      user_id: user.id,
      role: "member",
    })

    if (joinError) {
      console.error("Error joining forum:", joinError)
      return { error: `Failed to join forum: ${joinError.message}` }
    }

    console.log("Successfully joined forum")

    // Get current member count and increment it
    const { data: currentForum } = await supabase
      .from("forums")
      .select("member_count")
      .eq("id", forumId)
      .single()

    if (currentForum) {
      const newCount = (currentForum.member_count || 0) + 1
      const { error: updateError } = await supabase
        .from("forums")
        .update({
          member_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", forumId)

      if (updateError) {
        console.error("Error updating member count:", updateError)
        // Don't return error here as the join was successful
      }
    }

    revalidatePath("/explore")
    revalidatePath(`/forum/${forumId}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in joinForum:", error)
    return { error: error instanceof Error ? error.message : "Failed to join forum" }
  }
}

export async function leaveForum(forumId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Authentication required" }
    }

    // Remove user from forum
    const { error: leaveError } = await supabase
      .from("forum_members")
      .delete()
      .eq("forum_id", forumId)
      .eq("user_id", user.id)

    if (leaveError) {
      console.error("Error leaving forum:", leaveError)
      return { error: "Failed to leave forum" }
    }

    // Get current member count and decrement it
    const { data: currentForum } = await supabase
      .from("forums")
      .select("member_count")
      .eq("id", forumId)
      .single()

    if (currentForum) {
      const newCount = Math.max((currentForum.member_count || 0) - 1, 0)
      const { error: updateError } = await supabase
        .from("forums")
        .update({
          member_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", forumId)

      if (updateError) {
        console.error("Error updating member count:", updateError)
        // Don't return error here as the leave was successful
      }
    }

    revalidatePath("/explore")
    revalidatePath(`/forum/${forumId}`)
    return { success: true }
  } catch (error) {
    console.error("Leave forum error:", error)
    return { error: error instanceof Error ? error.message : "Failed to leave forum" }
  }
}

export async function followForum(forumId: string) {
  console.log("followForum called with forumId:", forumId)
  
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Follow forum auth check:", { user: user?.id, error: authError })

    if (authError || !user) {
      console.log("Authentication failed for follow")
      return { error: "Authentication required" }
    }

    // Check if user profile exists, create if not
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .limit(1)

    if (!existingProfile || existingProfile.length === 0) {
      console.log("Creating user profile for follow...")
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User",
          role: "user",
        })

      if (createProfileError) {
        console.error("Failed to create profile for follow:", createProfileError)
        return { error: "Failed to create user profile" }
      }
    }

    // Check if already following
    const { data: existingFollow, error: followCheckError } = await supabase
      .from("forum_follows")
      .select("id")
      .eq("forum_id", forumId)
      .eq("user_id", user.id)
      .limit(1)

    console.log("Follow check result:", { follow: existingFollow, error: followCheckError })

    if (followCheckError) {
      console.error("Error checking follow status:", followCheckError)
      return { error: "Failed to check follow status" }
    }

    if (existingFollow && existingFollow.length > 0) {
      console.log("User is already following")
      return { error: "Already following this forum" }
    }

    // Add follow
    console.log("Adding forum follow...")
    const { error: followError } = await supabase.from("forum_follows").insert({
      forum_id: forumId,
      user_id: user.id,
    })

    if (followError) {
      console.error("Error following forum:", followError)
      return { error: `Failed to follow forum: ${followError.message}` }
    }

    console.log("Successfully followed forum")
    revalidatePath("/explore")
    revalidatePath(`/forum/${forumId}`)
    return { success: true }
  } catch (error) {
    console.error("Follow forum error:", error)
    return { error: error instanceof Error ? error.message : "Failed to follow forum" }
  }
}

export async function unfollowForum(forumId: string) {
  console.log("unfollowForum called with forumId:", forumId)
  
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Unfollow forum auth check:", { user: user?.id, error: authError })

    if (authError || !user) {
      console.log("Authentication failed for unfollow")
      return { error: "Authentication required" }
    }

    // Remove follow
    console.log("Removing forum follow...")
    const { error: unfollowError } = await supabase
      .from("forum_follows")
      .delete()
      .eq("forum_id", forumId)
      .eq("user_id", user.id)

    if (unfollowError) {
      console.error("Error unfollowing forum:", unfollowError)
      return { error: `Failed to unfollow forum: ${unfollowError.message}` }
    }

    console.log("Successfully unfollowed forum")
    revalidatePath("/explore")
    revalidatePath(`/forum/${forumId}`)
    return { success: true }
  } catch (error) {
    console.error("Unfollow forum error:", error)
    return { error: error instanceof Error ? error.message : "Failed to unfollow forum" }
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
