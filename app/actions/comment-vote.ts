"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function voteOnComment(commentId: string, voteType: "upvote" | "downvote") {
  console.log("=== COMMENT VOTE ACTION CALLED ===")
  console.log("Comment ID:", commentId)
  console.log("Vote Type:", voteType)

  try {
    const currentUser = await requireAuth()
    console.log("Current user:", currentUser?.id)

    const supabase = await createServerSupabaseClient()

    // Convert string vote type to integer
    const normalizedVoteType = voteType === "upvote" ? 1 : -1
    console.log("Normalized vote type:", normalizedVoteType)

    // Check if user has already voted on this comment
    console.log("Checking for existing vote...")
    const { data: existingVote, error: selectError } = await supabase
      .from("comment_votes")
      .select("vote_type")
      .eq("comment_id", commentId)
      .eq("user_id", currentUser.id)
      .maybeSingle()

    console.log("Existing vote query result:", existingVote, selectError)

    if (selectError) {
      console.error("Select vote error:", selectError)
      return { success: false, error: "Failed to check existing vote" }
    }

    if (existingVote) {
      console.log("Found existing vote:", existingVote.vote_type)
      if (existingVote.vote_type === normalizedVoteType) {
        // Remove vote if clicking the same vote type
        console.log("Removing existing vote...")
        const { error: deleteError } = await supabase
          .from("comment_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUser.id)

        console.log("Delete result:", deleteError)
        if (deleteError) {
          console.error("Delete vote error:", deleteError)
          return { success: false, error: "Failed to remove vote" }
        }
      } else {
        // Update vote if clicking different vote type
        console.log("Updating existing vote...")
        const { error: updateError } = await supabase
          .from("comment_votes")
          .update({ vote_type: normalizedVoteType })
          .eq("comment_id", commentId)
          .eq("user_id", currentUser.id)

        console.log("Update result:", updateError)
        if (updateError) {
          console.error("Update vote error:", updateError)
          return { success: false, error: "Failed to update vote" }
        }
      }
    } else {
      // Create new vote
      console.log("Creating new vote...")
      const voteData = {
        comment_id: commentId,
        user_id: currentUser.id,
        vote_type: normalizedVoteType,
      }
      console.log("Vote data to insert:", voteData)

      const { data: insertData, error: insertError } = await supabase.from("comment_votes").insert(voteData).select()

      console.log("Insert result:", insertData, insertError)
      if (insertError) {
        console.error("Insert vote error:", insertError)
        return { success: false, error: "Failed to cast vote" }
      }
    }

    // Count votes directly from the database
    console.log("Counting votes...")
    const { count: upvoteCount, error: upvoteError } = await supabase
      .from("comment_votes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId)
      .eq("vote_type", 1)

    const { count: downvoteCount, error: downvoteError } = await supabase
      .from("comment_votes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId)
      .eq("vote_type", -1)

    console.log("Vote counts:", { upvoteCount, downvoteCount, upvoteError, downvoteError })

    const upvotes = upvoteCount || 0
    const downvotes = downvoteCount || 0

    console.log("=== COMMENT VOTE ACTION COMPLETE ===")
    revalidatePath("/")
    return {
      success: true,
      upvotes: upvotes,
      downvotes: downvotes,
    }
  } catch (error) {
    console.error("Comment vote error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
