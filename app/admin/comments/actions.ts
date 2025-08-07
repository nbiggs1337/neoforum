'use server'

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function deleteComment(formData: FormData) {
  const commentId = formData.get('commentId') as string

  if (!commentId) {
    throw new Error('Comment ID is required')
  }

  const supabase = await createServerSupabaseClient()

  // Get current user and verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error('Unauthorized: Admin access required')
  }

  try {
    // Mark the comment as deleted instead of actually deleting it
    const { error } = await supabase
      .from("comments")
      .update({ is_deleted: true })
      .eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      throw new Error('Failed to delete comment')
    }

    console.log(`Admin ${user.email} deleted comment ${commentId}`)
  } catch (error) {
    console.error("Error in deleteComment:", error)
    throw error
  }

  redirect("/admin/comments")
}
