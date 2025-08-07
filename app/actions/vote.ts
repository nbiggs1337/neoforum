"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function voteOnPost(postId: string, voteType: number) {
  console.log("=== POST VOTE ACTION START ===")
  console.log("Post ID:", postId, "Vote Type:", voteType)

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      console.log("No current user")
      return { success: false, error: "Not authenticated" }
    }

    console.log("Current user:", currentUser.id)

    const supabase = await createServerSupabaseClient()

    // Check for existing vote
    console.log("Checking for existing vote...")
    const { data: existingVote, error: existingVoteError } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", currentUser.id)
      .single()

    if (existingVoteError && existingVoteError.code !== "PGRST116") {
      console.error("Error checking existing vote:", existingVoteError)
      return { success: false, error: "Failed to check existing vote" }
    }

    console.log("Existing vote:", existingVote)

    let userVote = null

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        console.log("Removing existing vote...")
        const { error: deleteError } = await supabase
          .from("post_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)

        if (deleteError) {
          console.error("Delete error:", deleteError)
          return { success: false, error: "Failed to remove vote" }
        }
        console.log("Vote removed successfully")
        userVote = null
      } else {
        // Update existing vote
        console.log("Updating existing vote...")
        const { error: updateError } = await supabase
          .from("post_votes")
          .update({ vote_type: voteType })
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)

        if (updateError) {
          console.error("Update error:", updateError)
          return { success: false, error: "Failed to update vote" }
        }
        console.log("Vote updated successfully")
        userVote = voteType
      }
    } else {
      // Create new vote
      console.log("Creating new vote...")
      const { error: insertError } = await supabase.from("post_votes").insert({
        post_id: postId,
        user_id: currentUser.id,
        vote_type: voteType,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        return { success: false, error: "Failed to create vote" }
      }
      console.log("Vote created successfully")
      userVote = voteType
    }

    // Count all votes for this post
    console.log("Counting votes...")
    const { data: allVotes, error: votesError } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)

    if (votesError) {
      console.error("Error fetching votes:", votesError)
      return { success: false, error: "Failed to fetch votes" }
    }

    console.log("All votes data:", allVotes)

    const upvotes = allVotes?.filter((vote) => vote.vote_type === 1).length || 0
    const downvotes = allVotes?.filter((vote) => vote.vote_type === -1).length || 0

    console.log("Vote counts - Upvotes:", upvotes, "Downvotes:", downvotes)

    // Update post vote counts
    console.log("Updating post vote counts...")
    const { error: updatePostError } = await supabase
      .from("posts")
      .update({
        upvotes: upvotes,
        downvotes: downvotes,
      })
      .eq("id", postId)

    if (updatePostError) {
      console.error("Error updating post:", updatePostError)
      return { success: false, error: "Failed to update post vote counts" }
    }

    console.log("Post vote counts updated successfully")

    // Create notification for post author when liked (only for upvotes)
    if (userVote === 1) {
      const { data: post } = await supabase
        .from("posts")
        .select("author_id, title, profiles!posts_author_id_fkey(username)")
        .eq("id", postId)
        .single()

      if (post?.author_id && post.author_id !== currentUser.id) {
        await createNotification({
          userId: post.author_id,
          type: 'post_like',
          title: 'Someone liked your post',
          message: `${currentUser.username} liked your post "${post.title}"`,
          relatedPostId: postId,
          relatedUserId: currentUser.id,
        })
      }
    }

    // Revalidate paths
    revalidatePath("/forum/[subdomain]", "page")
    revalidatePath("/forum/[subdomain]/post/[postId]", "page")
    revalidatePath("/user/[username]", "page")
    revalidatePath("/explore")

    console.log("=== POST VOTE ACTION COMPLETE ===")

    return {
      success: true,
      upvotes,
      downvotes,
      userVote,
    }
  } catch (error) {
    console.error("Vote action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      upvotes: 0,
      downvotes: 0,
      userVote: null,
    }
  }
}
