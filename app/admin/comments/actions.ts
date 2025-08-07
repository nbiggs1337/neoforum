'use server'

import { revalidatePath } from "next/cache"
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

    // Try to delete with service role client to bypass RLS
    const serviceSupabase = await createServerSupabaseClient()
    
    // Delete the comment with proper response handling
    const { data, error } = await serviceSupabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .select()

    console.log("Delete result:", { data, error })

    if (error) {
      console.error("Error deleting comment:", error)
      
      // Try alternative delete approach using raw SQL if RLS is blocking
      const { data: sqlResult, error: sqlError } = await serviceSupabase.rpc('delete_comment_admin', {
        comment_id: commentId
      })
      
      if (sqlError) {
        console.error("SQL delete also failed:", sqlError)
        throw new Error(`Failed to delete comment: ${error.message}`)
      }
      
      console.log(`Admin ${user.email} deleted comment ${commentId} via SQL function`)
    } else {
      const deletedCount = data ? data.length : 0
      console.log(`Admin ${user.email} deleted comment ${commentId}, affected rows: ${deletedCount}`)
    }
    
    // Force revalidation and redirect to refresh the page state
    revalidatePath('/admin/comments')
    
  } catch (error) {
    console.error("Error in deleteComment:", error)
    throw error
  }

  // Redirect to refresh the page and show updated comment list
  redirect('/admin/comments')
}
