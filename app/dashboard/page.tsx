import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, MessageSquare, Settings, User, LogOut, Eye, ThumbsUp, Calendar, Image, Bell, ChevronLeft, ChevronRight, TrendingUp, Flame, Clock, Trophy } from 'lucide-react'
import { createServerSupabaseClient } from "@/lib/supabase"
import { CreateForumForm } from "@/components/create-forum-form"
import { NotificationBell } from "@/components/notification-bell"

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
    image_urls?: string[]
    created_at: string
    author: {
      username: string
    }
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
  pagination: {
    currentPage: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

async function getDashboardData(page: number = 1, sortBy: string = 'new'): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient()
  const postsPerPage = 5

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User error in dashboard:", userError)
    redirect("/login")
  }

  console.log("Dashboard: User authenticated:", user.id)

  // Create fallback profile first
  const fallbackProfile = {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
    display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    role: 'user',
    avatar_url: null,
    created_at: user.created_at || new Date().toISOString(),
  }

  // Try to get user profile
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)

  console.log("Profile query result:", { profiles, profileError })

  let profile = fallbackProfile
  if (profiles && profiles.length > 0) {
    profile = profiles[0] // Use the actual profile if it exists
  } else {
    console.log("No profile found, using fallback profile")
  }

  // Get user stats
  const [postsResult, commentsResult, votesResult, forumsResult] = await Promise.all([
    supabase.from("posts").select("id").eq("author_id", user.id),
    supabase.from("comments").select("id").eq("author_id", user.id),
    supabase.from("post_votes").select("id").eq("user_id", user.id).eq("vote_type", 1),
    supabase.from("forum_members").select("forum_id").eq("user_id", user.id),
  ])

  // Get total count of posts for pagination
  const { count: totalPostsCount } = await supabase
    .from("posts")
    .select("*", { count: 'exact', head: true })
    .eq("status", "published")

  const totalPages = Math.ceil((totalPostsCount || 0) / postsPerPage)
  const offset = (page - 1) * postsPerPage

  // Build query based on sort option
  let query = supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      upvotes,
      downvotes,
      comment_count,
      image_urls,
      created_at,
      author_id,
      forum_id
    `)
    .eq("status", "published")
    .range(offset, offset + postsPerPage - 1)

  // Apply sorting based on filter
  switch (sortBy) {
    case 'hot':
      // Hot: Sort by score (upvotes - downvotes) with recent bias
      query = query.order("upvotes", { ascending: false })
      break
    case 'trending':
      // Trending: Posts from last 7 days sorted by engagement
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("upvotes", { ascending: false })
      break
    case 'top':
      // Top: Highest upvoted posts
      query = query.order("upvotes", { ascending: false })
      break
    case 'new':
    default:
      // New: Most recent posts (default)
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: recentPosts, error: postsError } = await query

  console.log("Recent posts query result:", { data: recentPosts, error: postsError })

  // Get author and forum info separately to avoid join issues
  let enrichedPosts = []
  if (recentPosts && recentPosts.length > 0) {
    for (const post of recentPosts) {
      const [authorResult, forumResult] = await Promise.all([
        supabase.from("profiles").select("username").eq("id", post.author_id).limit(1),
        supabase.from("forums").select("name, subdomain").eq("id", post.forum_id).limit(1)
      ])

      if (authorResult.data && authorResult.data.length > 0 && forumResult.data && forumResult.data.length > 0) {
        enrichedPosts.push({
          ...post,
          author: { username: authorResult.data[0].username },
          forum: { name: forumResult.data[0].name, subdomain: forumResult.data[0].subdomain }
        })
      }
    }
  }

  // Get forums the user has joined - with better error handling
  console.log("Fetching forum memberships for user:", user.id)

  let joinedForums = []

  try {
    const { data: forumMemberships, error: membershipError } = await supabase
      .from("forum_members")
      .select("forum_id")
      .eq("user_id", user.id)

    console.log("Forum memberships query result:", { 
      data: forumMemberships, 
      error: membershipError,
      count: forumMemberships?.length || 0 
    })

    if (membershipError) {
      console.error("Forum membership error:", membershipError)
      // Continue with empty array instead of failing
    } else if (forumMemberships && forumMemberships.length > 0) {
      const forumIds = forumMemberships.map(m => m.forum_id)
      console.log("Forum IDs to fetch:", forumIds)
      
      const { data: forums, error: forumsError } = await supabase
        .from("forums")
        .select("id, name, subdomain, description, member_count, post_count")
        .in("id", forumIds)
        .eq("status", "active")

      console.log("Joined forums query result:", { 
        data: forums, 
        error: forumsError,
        count: forums?.length || 0 
      })

      if (forumsError) {
        console.error("Forums fetch error:", forumsError)
        // Continue with empty array
      } else if (forums && forums.length > 0) {
        joinedForums = forums
      }
    } else {
      console.log("No forum memberships found for user")
    }
  } catch (error) {
    console.error("Unexpected error fetching forum data:", error)
    // Continue with empty array
  }

  console.log("Final joined forums:", joinedForums)

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
    recentPosts: enrichedPosts,
    joinedForums: joinedForums,
    pagination: {
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}

async function signOut() {
  "use server"
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const sortBy = searchParams.sort || 'new'
  const data = await getDashboardData(page, sortBy)

  const filterOptions = [
    { value: 'new', label: 'New', icon: Clock },
    { value: 'hot', label: 'Hot', icon: Flame },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'top', label: 'Top', icon: Trophy },
  ]

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
                <NotificationBell />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Recent Posts */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-purple-300">Recent Posts</CardTitle>
                  <CreateForumForm />
                </div>
                
                {/* Filter Bar */}
                <div className="flex items-center space-x-2 mt-4">
                  {filterOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = sortBy === option.value
                    return (
                      <Link
                        key={option.value}
                        href={`/dashboard?sort=${option.value}&page=1`}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className={
                            isActive
                              ? "bg-purple-500 text-white hover:bg-purple-600"
                              : "text-purple-300 hover:text-white hover:bg-purple-500/20"
                          }
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {option.label}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentPosts.length > 0 ? (
                  <>
                    {data.recentPosts.map((post) => {
                      const hasImages = Array.isArray(post.image_urls) && post.image_urls.length > 0
                      return (
                        <div
                          key={post.id}
                          className="border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Link href={`/forum/${post.forum.subdomain}/post/${post.id}`}>
                              <h3 className="font-semibold text-white hover:text-purple-300 transition-colors">
                                {post.title}
                              </h3>
                            </Link>
                            {hasImages && (
                              <Badge className="bg-gradient-to-r from-purple-600 to-cyan-400 text-black text-xs px-2 py-1">
                                <Image className="w-3 h-3 mr-1" />
                                Photo
                              </Badge>
                            )}
                          </div>
                          
                          {hasImages && (
                            <div className="mb-3">
                              <div className="grid grid-cols-6 gap-1">
                                {post.image_urls!.slice(0, 3).map((imageUrl: string, index: number) => (
                                  <div key={index} className="relative aspect-square">
                                    <img
                                      src={imageUrl || "/placeholder.svg"}
                                      alt={`Post image ${index + 1}`}
                                      className="w-full h-full object-cover rounded border border-purple-500/30"
                                    />
                                    {index === 2 && post.image_urls!.length > 3 && (
                                      <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                          +{post.image_urls!.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Link href={`/forum/${post.forum.subdomain}`} className="text-purple-400 hover:text-purple-300">
                                f/{post.forum.subdomain}
                              </Link>
                              <span className="text-gray-500">•</span>
                              <Link href={`/user/${post.author.username}`} className="text-cyan-400 hover:text-cyan-300">
                                u/{post.author.username}
                              </Link>
                            </div>
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
                      )
                    })}
                    
                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                          {data.pagination.hasPrev && (
                            <Link href={`/dashboard?sort=${sortBy}&page=${data.pagination.currentPage - 1}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </Button>
                            </Link>
                          )}
                          {data.pagination.hasNext && (
                            <Link href={`/dashboard?sort=${sortBy}&page=${data.pagination.currentPage + 1}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          Page {data.pagination.currentPage} of {data.pagination.totalPages}
                        </span>
                      </div>
                    )}
                  </>
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
              <CardContent className="max-h-[48rem] overflow-y-auto space-y-4">
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
