"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function voteOnComment(commentId: string, voteType: "upvote" | "downvote" | null) {
  console.log("=== COMMENT VOTE ACTION CALLED ===")
  console.log("Comment ID:", commentId)
  console.log("Vote Type:", voteType)

  try {
    const currentUser = await requireAuth()
    console.log("Current user:", currentUser?.id)

    const supabase = await createServerSupabaseClient()

    // Convert string vote type to integer or null
    const normalizedVoteType = voteType === "upvote" ? 1 : voteType === "downvote" ? -1 : null
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
      if (normalizedVoteType === null || existingVote.vote_type === normalizedVoteType) {
        // Remove vote if clicking the same vote type or if voteType is null
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
    } else if (normalizedVoteType !== null) {
      // Create new vote only if voteType is not null
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

    // Wait a moment for database consistency
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Count votes directly from the database
    console.log("Counting votes...")
    const { data: allVotes, error: votesError } = await supabase
      .from("comment_votes")
      .select("vote_type")
      .eq("comment_id", commentId)

    console.log("All votes for comment:", allVotes, votesError)

    if (votesError) {
      console.error("Error fetching votes:", votesError)
      return { success: false, error: "Failed to count votes" }
    }

    const upvotes = allVotes?.filter((vote) => vote.vote_type === 1).length || 0
    const downvotes = allVotes?.filter((vote) => vote.vote_type === -1).length || 0

    console.log("Final vote counts:", { upvotes, downvotes })

    // Update comment vote counts in the comments table
    const { error: updateCommentError } = await supabase
      .from("comments")
      .update({
        upvotes: upvotes,
        downvotes: downvotes,
      })
      .eq("id", commentId)

    if (updateCommentError) {
      console.error("Error updating comment vote counts:", updateCommentError)
    }

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
