import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, User, Shield, Crown } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { VoteButtons } from "@/components/vote-buttons"

interface UserData {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

interface PostData {
  id: string
  title: string
  content: string
  created_at: string
  upvotes: number
  downvotes: number
  comment_count: number
  forum_subdomain: string
  forum_name: string
}

async function getUserData(username: string): Promise<{
  user: UserData
  posts: PostData[]
  upvotedPosts: PostData[]
  downvotedPosts: PostData[]
}> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, role, created_at")
      .eq("username", username)
      .single()

    if (userError || !user) {
      console.error("User fetch error:", userError)
      throw new Error("Not found")
    }

    // Get user's posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        created_at,
        upvotes,
        downvotes,
        comment_count,
        forum:forums(subdomain, name)
      `)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      throw new Error("Failed to fetch posts")
    }

    // Get posts user has upvoted
    const { data: upvotedPosts, error: upvotedError } = await supabase
      .from("post_votes")
      .select(`
        post:posts(
          id,
          title,
          content,
          created_at,
          upvotes,
          downvotes,
          comment_count,
          forum:forums(subdomain, name)
        )
      `)
      .eq("user_id", user.id)
      .eq("vote_type", 1)
      .order("created_at", { ascending: false })

    if (upvotedError) {
      console.error("Upvoted posts fetch error:", upvotedError)
      throw new Error("Failed to fetch upvoted posts")
    }

    // Get posts user has downvoted
    const { data: downvotedPosts, error: downvotedError } = await supabase
      .from("post_votes")
      .select(`
        post:posts(
          id,
          title,
          content,
          created_at,
          upvotes,
          downvotes,
          comment_count,
          forum:forums(subdomain, name)
        )
      `)
      .eq("user_id", user.id)
      .eq("vote_type", -1)
      .order("created_at", { ascending: false })

    if (downvotedError) {
      console.error("Downvoted posts fetch error:", downvotedError)
      throw new Error("Failed to fetch downvoted posts")
    }

    // Transform the data
    const transformedPosts =
      posts?.map((post: any) => ({
        ...post,
        forum_subdomain: post.forum?.subdomain,
        forum_name: post.forum?.name,
      })) || []

    const transformedUpvotedPosts =
      upvotedPosts
        ?.map((item: any) => ({
          ...item.post,
          forum_subdomain: item.post?.forum?.subdomain,
          forum_name: item.post?.forum?.name,
        }))
        .filter(Boolean) || []

    const transformedDownvotedPosts =
      downvotedPosts
        ?.map((item: any) => ({
          ...item.post,
          forum_subdomain: item.post?.forum?.subdomain,
          forum_name: item.post?.forum?.name,
        }))
        .filter(Boolean) || []

    return {
      user,
      posts: transformedPosts,
      upvotedPosts: transformedUpvotedPosts,
      downvotedPosts: transformedDownvotedPosts,
    }
  } catch (error) {
    console.error("User data fetch error:", error)
    throw error
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case "admin":
      return <Crown className="w-4 h-4 text-yellow-400" />
    case "moderator":
      return <Shield className="w-4 h-4 text-blue-400" />
    default:
      return <User className="w-4 h-4 text-gray-400" />
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Admin</Badge>
    case "moderator":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Moderator</Badge>
    default:
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">User</Badge>
  }
}

function PostCard({ post }: { post: PostData }) {
  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Link
                href={`/forum/${post.forum_subdomain}`}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                f/{post.forum_subdomain}
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <Link href={`/forum/${post.forum_subdomain}/post/${post.id}`} className="block group">
              <h3 className="text-white font-semibold mb-3 group-hover:text-purple-300 transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">{post.content}</p>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comment_count || 0} comments</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <VoteButtons postId={post.id} initialUpvotes={post.upvotes || 0} initialDownvotes={post.downvotes || 0} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  try {
    const { username } = await params
    const { user, posts, upvotedPosts, downvotedPosts } = await getUserData(username)

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Animated nightscape background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
          <div className="absolute inset-0 nightscape-bg"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-purple-300">@{user.username}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-black" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">@{user.username}</h1>
                      {getRoleIcon(user.role)}
                    </div>
                    {user.display_name && <p className="text-gray-400 text-lg mb-2">{user.display_name}</p>}
                    <div className="flex items-center gap-2">{getRoleBadge(user.role)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Profile Info */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-8">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    {user.bio && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">About</h3>
                        <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="w-5 h-5" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <MessageSquare className="w-5 h-5" />
                        <span>{posts.length} posts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="posts" className="space-y-6">
              <TabsList className="bg-black/50 border border-purple-500/30 p-1">
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 px-6 py-3"
                >
                  Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upvoted"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 px-6 py-3"
                >
                  Upvoted ({upvotedPosts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="downvoted"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 px-6 py-3"
                >
                  Downvoted ({downvotedPosts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-3">No posts yet</h3>
                      <p className="text-gray-500 text-lg">This user hasn't created any posts.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="upvoted" className="space-y-6">
                {upvotedPosts.length > 0 ? (
                  upvotedPosts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <ThumbsUp className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-3">No upvoted posts</h3>
                      <p className="text-gray-500 text-lg">This user hasn't upvoted any posts.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="downvoted" className="space-y-6">
                {downvotedPosts.length > 0 ? (
                  downvotedPosts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <ThumbsDown className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-3">No downvoted posts</h3>
                      <p className="text-gray-500 text-lg">This user hasn't downvoted any posts.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("User profile page error:", error)
    notFound()
  }
}
