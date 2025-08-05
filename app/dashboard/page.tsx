import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, MessageSquare, Settings, User, LogOut, Eye, ThumbsUp, Calendar } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { CreateForumForm } from "@/components/create-forum-form"

interface DashboardData {
  user: {
    id: string
    username: string
    display_name: string
    role: string
    avatar_url?: string
    created_at: string
  }
  stats: {
    totalPosts: number
    totalComments: number
    totalUpvotes: number
    forumsJoined: number
  }
  recentPosts: Array<{
    id: string
    title: string
    content: string
    upvotes: number
    downvotes: number
    comment_count: number
    created_at: string
    forum: {
      name: string
      subdomain: string
    }
  }>
  joinedForums: Array<{
    id: string
    name: string
    subdomain: string
    description: string
    member_count: number
    post_count: number
  }>
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Get user stats
  const [postsResult, commentsResult, votesResult, forumsResult] = await Promise.all([
    supabase.from("posts").select("id").eq("author_id", user.id),
    supabase.from("comments").select("id").eq("author_id", user.id),
    supabase.from("post_votes").select("id").eq("user_id", user.id).eq("vote_type", 1),
    supabase.from("forum_members").select("forum_id").eq("user_id", user.id),
  ])

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      upvotes,
      downvotes,
      comment_count,
      created_at,
      forums!inner(name, subdomain)
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get joined forums
  const { data: joinedForums } = await supabase
    .from("forum_members")
    .select(`
      forums!inner(
        id,
        name,
        subdomain,
        description,
        member_count,
        post_count
      )
    `)
    .eq("user_id", user.id)
    .limit(6)

  return {
    user: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
    },
    stats: {
      totalPosts: postsResult.data?.length || 0,
      totalComments: commentsResult.data?.length || 0,
      totalUpvotes: votesResult.data?.length || 0,
      forumsJoined: forumsResult.data?.length || 0,
    },
    recentPosts:
      recentPosts?.map((post) => ({
        ...post,
        forum: post.forums,
      })) || [],
    joinedForums: joinedForums?.map((item) => item.forums).filter(Boolean) || [],
  }
}

async function signOut() {
  "use server"
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cyberpunk background */}
      <div className="fixed inset-0 cyberpunk-enhanced">
        <div className="absolute inset-0 cyberpunk-bg"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center animate-glow">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  NeoForum
                </h1>
              </Link>

              <div className="flex items-center space-x-4">
                <Link href="/explore">
                  <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                    Explore
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-white hover:bg-red-500/20">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                {data.user.avatar_url ? (
                  <img
                    src={data.user.avatar_url || "/placeholder.svg"}
                    alt={data.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-black" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome back, {data.user.display_name || data.user.username}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                    {data.user.role}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    Member since {new Date(data.user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Posts</p>
                    <p className="text-2xl font-bold text-purple-300">{data.stats.totalPosts}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Comments</p>
                    <p className="text-2xl font-bold text-cyan-300">{data.stats.totalComments}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Upvotes Given</p>
                    <p className="text-2xl font-bold text-green-300">{data.stats.totalUpvotes}</p>
                  </div>
                  <ThumbsUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Forums Joined</p>
                    <p className="text-2xl font-bold text-orange-300">{data.stats.forumsJoined}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-purple-300">Recent Posts</CardTitle>
                  <CreateForumForm />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentPosts.length > 0 ? (
                  data.recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <Link href={`/forum/${post.forum.subdomain}/post/${post.id}`}>
                        <h3 className="font-semibold text-white hover:text-purple-300 transition-colors mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <Link href={`/forum/${post.forum.subdomain}`} className="text-purple-400 hover:text-purple-300">
                          f/{post.forum.subdomain}
                        </Link>
                        <div className="flex items-center space-x-4 text-gray-500">
                          <span className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {post.upvotes - post.downvotes}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comment_count}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No posts yet</p>
                    <p className="text-gray-500 text-sm">Start by creating your first post!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Joined Forums */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-cyan-300">Your Forums</CardTitle>
                  <Link href="/explore">
                    <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
                      <Eye className="w-4 h-4 mr-2" />
                      Explore More
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.joinedForums.length > 0 ? (
                  data.joinedForums.map((forum) => (
                    <div
                      key={forum.id}
                      className="border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
                    >
                      <Link href={`/forum/${forum.subdomain}`}>
                        <h3 className="font-semibold text-white hover:text-cyan-300 transition-colors mb-2">
                          {forum.name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{forum.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {forum.member_count} members
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {forum.post_count} posts
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No forums joined yet</p>
                    <p className="text-gray-500 text-sm">Discover and join communities!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CreateForumForm />
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Explore Forums
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
