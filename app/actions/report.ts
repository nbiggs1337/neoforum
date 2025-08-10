"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createReport(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to submit a report",
      }
    }

    const postId = formData.get("postId") as string | null
    const commentId = formData.get("commentId") as string | null
    const reason = formData.get("reason") as string
    const details = formData.get("details") as string

    if ((!postId && !commentId) || !reason) {
      return {
        success: false,
        error: "A target (post or comment) and a reason are required",
      }
    }
    if (postId && commentId) {
      return {
        success: false,
        error: "Cannot report a post and a comment simultaneously",
      }
    }

    const supabase = await createServerSupabaseClient()

    // Check for existing report on the same post or comment by the same user
    let existingReportQuery = supabase.from("reports").select("id").eq("reporter_id", user.id)

    if (postId) {
      existingReportQuery = existingReportQuery.eq("post_id", postId)
    } else if (commentId) {
      existingReportQuery = existingReportQuery.eq("comment_id", commentId)
    }

    const { data: existingReport } = await existingReportQuery.single()

    if (existingReport) {
      const targetType = postId ? "post" : "comment"
      return {
        success: false,
        error: `You have already reported this ${targetType}`,
      }
    }

    // Prepare data for insertion
    const reportData: {
      reporter_id: string
      reason: string
      details: string | null
      status: "pending"
      post_id?: string | null
      comment_id?: string | null
    } = {
      reporter_id: user.id,
      reason,
      details: details || null,
      status: "pending",
      post_id: postId,
      comment_id: commentId,
    }

    const { error } = await supabase.from("reports").insert(reportData)

    if (error) {
      console.error("Report creation error:", error)
      if (error.code === "23505") {
        // Handle unique constraint violation
        const targetType = postId ? "post" : "comment"
        return { success: false, error: `You have already reported this ${targetType}` }
      }
      return {
        success: false,
        error: "Failed to submit report due to a database error.",
      }
    }

    // Revalidate admin pages to show the new report
    revalidatePath("/admin/reports")

    return {
      success: true,
      message: "Report submitted successfully",
    }
  } catch (error) {
    console.error("Report error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
