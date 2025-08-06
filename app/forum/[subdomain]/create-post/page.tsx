import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { CreatePostForm } from "@/components/create-post-form"

interface CreatePostPageProps {
  params: {
    subdomain: string
  }
}

async function createPost(formData: FormData) {
  "use server"

  try {
    const supabase = await createServerSupabaseClient()
    const subdomain = formData.get("subdomain") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const postType = formData.get("postType") as string
    const imageUrls = formData.get("imageUrls") as string

    console.log("Creating post with data:", {
      subdomain,
      title: title?.substring(0, 50),
      content: content?.substring(0, 50),
      postType,
      imageUrls: imageUrls?.substring(0, 100),
    })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      return { error: "Authentication error" }
    }

    if (!user) {
      console.error("No user found")
      return { error: "Authentication required" }
    }

    console.log("User authenticated:", user.id)

    // Get forum
    const { data: forum, error: forumError } = await supabase
      .from("forums")
      .select("id, name")
      .eq("subdomain", subdomain)
      .single()

    if (forumError) {
      console.error("Forum error:", forumError)
      return { error: "Forum not found" }
    }

    if (!forum) {
      console.error("No forum found for subdomain:", subdomain)
      return { error: "Forum not found" }
    }

    console.log("Forum found:", forum.id, forum.name)

    // Check if user is a member or auto-join them
    const { data: membership } = await supabase
      .from("forum_members")
      .select("id")
      .eq("forum_id", forum.id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      console.log("Auto-joining user to forum...")
      // Auto-join user to forum
      const { error: joinError } = await supabase.from("forum_members").insert({
        forum_id: forum.id,
        user_id: user.id,
        role: "member",
      })

      if (joinError) {
        console.error("Auto-join error:", joinError)
        return { error: "Failed to join forum" }
      }
      console.log("User auto-joined to forum")
    } else {
      console.log("User is already a member")
    }

    // Prepare post data
    const postData: any = {
      title,
      content,
      author_id: user.id,
      forum_id: forum.id,
      status: "published",
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
    }

    // Add image URLs if it's a photo post
    if (postType === "photo" && imageUrls) {
      try {
        postData.image_urls = JSON.parse(imageUrls)
      } catch (error) {
        console.error("Error parsing image URLs:", error)
        return { error: "Invalid image data" }
      }
    }

    // Create the post
    console.log("Creating post...")
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select("id")
      .single()

    if (postError) {
      console.error("Create post error:", postError)
      return { error: `Failed to create post: ${postError.message}` }
    }

    if (!post) {
      console.error("No post returned after creation")
      return { error: "Failed to create post" }
    }

    console.log("Post created successfully:", post.id)

    // Update forum post count
    try {
      const { data: currentForum } = await supabase.from("forums").select("post_count").eq("id", forum.id).single()

      if (currentForum) {
        await supabase
          .from("forums")
          .update({ post_count: (currentForum.post_count || 0) + 1 })
          .eq("id", forum.id)
        console.log("Forum post count updated")
      }
    } catch (error) {
      console.error("Post count update failed:", error)
      // Don't fail the entire operation if post count update fails
    }

    // Revalidate the forum page
    revalidatePath(`/forum/${subdomain}`)

    // Return success with redirect URL instead of using redirect()
    return { 
      success: true, 
      redirectTo: `/forum/${subdomain}`,
      postId: post.id 
    }
  } catch (error) {
    console.error("Create post error:", error)
    return { error: `Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export default async function CreatePostPage({ params }: CreatePostPageProps) {
  const { subdomain } = params
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get forum data
  const { data: forum, error: forumError } = await supabase
    .from("forums")
    .select("id, name, subdomain")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single()

  if (forumError || !forum) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cyberpunk background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.1) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/forum/${subdomain}`}
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {forum.name}
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create Post
            </h1>
            <p className="text-gray-400 mt-2">Share your thoughts with the {forum.name} community</p>
          </div>

          {/* Create Post Form */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-purple-300">New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <CreatePostForm subdomain={subdomain} createPostAction={createPost} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
