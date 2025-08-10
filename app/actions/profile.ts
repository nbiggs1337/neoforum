"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Not authenticated")
    }

    const username = formData.get("username") as string
    const displayName = formData.get("display_name") as string
    const bio = formData.get("bio") as string
    const avatarUrl = formData.get("avatar_url") as string

    if (!username) {
      return { error: "Username is required" }
    }

    // Validate username for spaces
    if (username.includes(" ")) {
      return { error: "Username cannot contain spaces" }
    }

    // Check if username is already taken by another user
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Update user profile
    const updateData: any = {
      username,
      display_name: displayName || username,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

    if (error) {
      console.error("Profile update error:", error)
      return { error: "Failed to update profile" }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: error instanceof Error ? error.message : "Failed to update profile" }
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const currentPassword = formData.get("current_password") as string
  const newPassword = formData.get("new_password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Password update error:", error)
      return { error: "Failed to update password. Please check your current password." }
    }

    return { success: true }
  } catch (error) {
    console.error("Password update error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Not authenticated")
    }

    const file = formData.get("avatar") as File
    if (!file || file.size === 0) {
      throw new Error("No file provided")
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    console.log("Uploading file:", fileName, "Size:", file.size)

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage.from("user-uploads").upload(filePath, file, {
      upsert: true,
    })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    console.log("Upload successful:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-uploads").getPublicUrl(filePath)

    console.log("Public URL:", publicUrl)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Profile avatar update error:", updateError)
      throw new Error(`Failed to update profile avatar: ${updateError.message}`)
    }

    console.log("Profile updated with avatar URL:", publicUrl)

    revalidatePath("/settings")
    return { success: true, avatarUrl: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: error instanceof Error ? error.message : "Failed to upload avatar" }
  }
}

export async function updateAvatarUrl(avatarUrl: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Update avatar_url error:", error)
      return { error: "Failed to update avatar" }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Update avatar_url action error:", error)
    return { error: error instanceof Error ? error.message : "Failed to update avatar" }
  }
}
