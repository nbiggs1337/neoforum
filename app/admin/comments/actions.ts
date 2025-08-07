'use server'

import { revalidatePath } from "next/cache"
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
    throw new Error('Not authenticated')
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
    // First check if comment exists and get its details
    const { data: existingComment, error: checkError } = await supabase
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single()

    console.log("Comment check result:", { existingComment, checkError })

    if (checkError || !existingComment) {
      console.error("Comment not found:", checkError)
      throw new Error('Comment not found')
    }

    // Use the SQL function to bypass RLS for soft delete
    const { data: sqlResult, error: sqlError } = await supabase.rpc('soft_delete_comment_admin', {
      comment_id: commentId,
      admin_user_id: user.id
    })

    console.log("SQL soft delete result:", { sqlResult, sqlError })

    if (sqlError) {
      console.error("SQL soft delete failed:", sqlError)
      throw new Error(`Failed to soft delete comment: ${sqlError.message}`)
    }

    if (sqlResult === true) {
      console.log(`Admin ${user.email} soft deleted comment ${commentId} via SQL function`)
      
      // Verify the update worked by checking the comment again
      const { data: updatedComment } = await supabase
        .from("comments")
        .select("is_deleted, deleted_at, deleted_by")
        .eq("id", commentId)
        .single()

      console.log("Updated comment verification:", updatedComment)
    } else {
      console.error("SQL function returned false - comment may not exist")
      throw new Error('Failed to soft delete comment - comment may not exist')
    }
    
    // Revalidate the admin comments page to refresh the data
    revalidatePath('/admin/comments')
    
    return { success: true }
  } catch (error) {
    console.error("Error in deleteComment:", error)
    throw error
  }
}
