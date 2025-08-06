"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function voteOnPost(postId: string, voteType: number) {
  console.log("=== VOTE ACTION START ===")
  console.log("Post ID:", postId, "Vote Type:", voteType)

  try {
    // Create Supabase client first
    const supabase = await createServerSupabaseClient()
    console.log("Supabase client created")

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      throw new Error("Authentication required")
    }

    console.log("User ID:", user.id)

    // Get or create user profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      console.log("Creating user profile...")
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          display_name:
            user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User",
          role: "user",
        })
        .select()
        .single()

      if (createError) {
        console.error("Failed to create user profile:", createError)
        throw new Error("Failed to create user profile")
      }

      profile = newProfile
      console.log("Profile created successfully:", profile)
    } else if (profileError) {
      console.error("Profile fetch error:", profileError)
      throw new Error("Failed to fetch user profile")
    }

    if (!profile) {
      throw new Error("User profile not found")
    }

    console.log("User profile found:", profile.username)

    // Check for existing vote
    console.log("Checking for existing vote...")
    const { data: existingVote, error: existingVoteError } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingVoteError && existingVoteError.code !== "PGRST116") {
      console.error("Error checking existing vote:", existingVoteError)
      throw new Error("Failed to check existing vote")
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
          .eq("user_id", user.id)

        if (deleteError) {
          console.error("Delete error:", deleteError)
          throw new Error("Failed to remove vote")
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
          .eq("user_id", user.id)

        if (updateError) {
          console.error("Update error:", updateError)
          throw new Error("Failed to update vote")
        }
        console.log("Vote updated successfully")
        userVote = voteType
      }
    } else {
      // Create new vote
      console.log("Creating new vote...")
      const { error: insertError } = await supabase.from("post_votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        throw new Error("Failed to create vote")
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
      throw new Error("Failed to fetch votes")
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
      throw new Error("Failed to update post vote counts")
    }

    console.log("Post vote counts updated successfully")

    // Revalidate paths
    revalidatePath("/forum/[subdomain]", "page")
    revalidatePath("/forum/[subdomain]/post/[postId]", "page")
    revalidatePath("/user/[username]", "page")
    revalidatePath("/explore")

    console.log("=== VOTE ACTION COMPLETE ===")

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
