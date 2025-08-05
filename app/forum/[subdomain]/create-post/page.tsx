import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

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

    console.log("Creating post with data:", {
      subdomain,
      title: title?.substring(0, 50),
      content: content?.substring(0, 50),
    })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      throw new Error("Authentication error")
    }

    if (!user) {
      console.error("No user found")
      throw new Error("Authentication required")
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
      throw new Error("Forum not found")
    }

    if (!forum) {
      console.error("No forum found for subdomain:", subdomain)
      throw new Error("Forum not found")
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
        throw new Error("Failed to join forum")
      }
      console.log("User auto-joined to forum")
    } else {
      console.log("User is already a member")
    }

    // Create the post
    console.log("Creating post...")
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        author_id: user.id,
        forum_id: forum.id,
        status: "published",
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
      })
      .select("id")
      .single()

    if (postError) {
      console.error("Create post error:", postError)
      throw new Error(`Failed to create post: ${postError.message}`)
    }

    if (!post) {
      console.error("No post returned after creation")
      throw new Error("Failed to create post")
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

    // Redirect to the forum page
    redirect(`/forum/${subdomain}`)
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Allow redirect to work
    }
    console.error("Create post error:", error)
    throw new Error(`Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`)
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
              <form action={createPost} className="space-y-6">
                <input type="hidden" name="subdomain" value={subdomain} />

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter your post title..."
                    required
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-gray-300">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="What's on your mind?"
                    required
                    rows={12}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Link href={`/forum/${subdomain}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                  >
                    Create Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
