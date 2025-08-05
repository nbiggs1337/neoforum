import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoteButtons } from "@/components/vote-buttons"
import { JoinForumButton } from "@/components/join-forum-button"
import { FollowForumButton } from "@/components/follow-forum-button"
import { Users, MessageSquare, Calendar, Plus, TrendingUp, Clock, Zap } from "lucide-react"
import Link from "next/link"

interface ForumPageProps {
  params: { subdomain: string }
}

async function getForumData(subdomain: string) {
  try {
    const supabase = await createServerSupabaseClient()

    console.log("Fetching forum data for subdomain:", subdomain)

    // Get forum details with accurate post count
    const { data: forum, error: forumError } = await supabase
      .from("forums")
      .select(`
        id,
        name,
        subdomain,
        description,
        long_description,
        category,
        owner_id,
        status,
        member_count,
        thread_count,
        is_private,
        created_at,
        updated_at
      `)
      .eq("subdomain", subdomain)
      .eq("status", "active")
      .single()

    if (forumError || !forum) {
      console.error("Forum fetch error:", forumError)
      throw new Error("Not found")
    }

    // Get accurate post count
    const { count: postCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("forum_id", forum.id)
      .eq("status", "published")

    // Add the accurate post count to the forum object
    const forumWithPostCount = {
      ...forum,
      post_count: postCount || 0,
    }

    console.log("Forum found:", forum.name)

    // Get posts with vote counts from database
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        author_id,
        forum_id,
        status,
        upvotes,
        downvotes,
        comment_count,
        created_at,
        updated_at,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("forum_id", forum.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return { forum: forumWithPostCount, posts: [] }
    }

    console.log("Posts found:", posts?.length || 0)

    return { forum: forumWithPostCount, posts: posts || [] }
  } catch (error) {
    console.error("Forum data fetch error:", error)
    throw error
  }
}

async function getUserVotes(postIds: string[], userId: string) {
  if (!userId || postIds.length === 0) return {}

  const supabase = await createServerSupabaseClient()

  const { data: votes } = await supabase
    .from("post_votes")
    .select("post_id, vote_type")
    .eq("user_id", userId)
    .in("post_id", postIds)

  const voteMap: Record<string, number> = {}
  votes?.forEach((vote) => {
    voteMap[vote.post_id] = vote.vote_type
  })

  return voteMap
}

function calculateHotScore(upvotes: number, downvotes: number, createdAt: string): number {
  const score = upvotes - downvotes
  const order = Math.log10(Math.max(Math.abs(score), 1))
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0
  const seconds = (new Date().getTime() - new Date(createdAt).getTime()) / 1000
  const hotScore = sign * order + seconds / 45000
  return hotScore
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { subdomain } = params
  const currentUser = await getCurrentUser()

  try {
    const { forum, posts } = await getForumData(subdomain)

    // Get user votes for all posts
    const postIds = posts.map((post) => post.id)
    const userVotes = currentUser ? await getUserVotes(postIds, currentUser.id) : {}

    // Sort posts for hot tab
    const hotPosts = [...posts].sort((a, b) => {
      const scoreA = calculateHotScore(a.upvotes || 0, a.downvotes || 0, a.created_at)
      const scoreB = calculateHotScore(b.upvotes || 0, b.downvotes || 0, b.created_at)
      return scoreB - scoreA
    })

    return (
      <div className="min-h-screen cyberpunk-bg">
        <div className="cyberpunk-enhanced min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <nav className="flex items-center space-x-2 text-sm">
                <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Home
                </Link>
                <span className="text-purple-500">/</span>
                <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Explore
                </Link>
                <span className="text-purple-500">/</span>
                <span className="text-white font-medium">{forum.name}</span>
              </nav>
            </div>
            {/* Forum Header - Enhanced Cyberpunk Style */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-400/20 rounded-2xl blur-xl"></div>
              <Card className="relative bg-black/80 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center text-3xl font-bold animate-glow">
                        {forum.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                        {forum.name}
                      </h1>
                      <p className="text-cyan-400/80 text-lg font-mono mb-4">/forum/{forum.subdomain}</p>
                      {forum.description && (
                        <p className="text-gray-300 text-lg leading-relaxed">{forum.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Badge className="bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold px-4 py-2">
                      {forum.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-cyan-400 bg-black/50 px-4 py-2 rounded-lg border border-cyan-400/30">
                      <Users className="w-5 h-5" />
                      <span className="font-mono">{(forum.member_count || 0).toLocaleString()}</span>
                      <span className="text-gray-400">members</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 bg-black/50 px-4 py-2 rounded-lg border border-purple-400/30">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-mono">{(forum.post_count || 0).toLocaleString()}</span>
                      <span className="text-gray-400">posts</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <JoinForumButton forumId={forum.id} memberCount={forum.member_count || 0} />
                    <FollowForumButton forumId={forum.id} />
                    <Link href={`/forum/${forum.subdomain}/create-post`}>
                      <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Post
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3">
                {/* Enhanced Tabs */}
                <Tabs defaultValue="latest" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-purple-500/30 rounded-xl p-1 mb-8">
                    <TabsTrigger
                      value="latest"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-black font-semibold rounded-lg transition-all duration-300"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Latest
                    </TabsTrigger>
                    <TabsTrigger
                      value="hot"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-500 data-[state=active]:text-black font-semibold rounded-lg transition-all duration-300"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Hot
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="latest" className="space-y-6">
                    {posts.length === 0 ? (
                      <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                          <div className="relative mb-6">
                            <MessageSquare className="w-16 h-16 mx-auto text-purple-400 animate-pulse" />
                            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-cyan-400 mb-4">No posts yet</h3>
                          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                            Be the first to start a discussion in this cyberpunk forum!
                          </p>
                          <Link href={`/forum/${forum.subdomain}/create-post`}>
                            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                              <Zap className="w-5 h-5 mr-2" />
                              Create First Post
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      posts.map((post) => (
                        <Card
                          key={post.id}
                          className="bg-black/60 border-purple-500/20 hover:border-cyan-400/40 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
                        >
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <VoteButtons
                                postId={post.id}
                                initialUpvotes={post.upvotes || 0}
                                initialDownvotes={post.downvotes || 0}
                                userVote={userVotes[post.id] || null}
                              />
                              <div className="flex-1">
                                <Link href={`/forum/${forum.subdomain}/post/${post.id}`}>
                                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-3 leading-tight">
                                    {post.title}
                                  </h3>
                                </Link>
                                <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                                  {post.content.substring(0, 200)}
                                  {post.content.length > 200 && "..."}
                                </p>
                                <div className="flex items-center gap-6 text-sm">
                                  <Link
                                    href={`/user/${post.profiles?.username || "unknown"}`}
                                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                                  >
                                    by {post.profiles?.username || "Unknown"}
                                  </Link>
                                  <div className="flex items-center gap-2 text-cyan-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="font-mono">{post.comment_count || 0}</span>
                                    <span>comments</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="hot" className="space-y-6">
                    {hotPosts.length === 0 ? (
                      <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                          <div className="relative mb-6">
                            <TrendingUp className="w-16 h-16 mx-auto text-purple-400 animate-pulse" />
                            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-cyan-400 mb-4">No hot posts yet</h3>
                          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                            Create engaging content to see it trending here!
                          </p>
                          <Link href={`/forum/${forum.subdomain}/create-post`}>
                            <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-black font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                              <Zap className="w-5 h-5 mr-2" />
                              Create First Post
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      hotPosts.map((post) => (
                        <Card
                          key={post.id}
                          className="bg-black/60 border-purple-500/20 hover:border-cyan-400/40 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
                        >
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <VoteButtons
                                postId={post.id}
                                initialUpvotes={post.upvotes || 0}
                                initialDownvotes={post.downvotes || 0}
                                userVote={userVotes[post.id] || null}
                              />
                              <div className="flex-1">
                                <Link href={`/forum/${forum.subdomain}/post/${post.id}`}>
                                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-3 leading-tight">
                                    {post.title}
                                  </h3>
                                </Link>
                                <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                                  {post.content.substring(0, 200)}
                                  {post.content.length > 200 && "..."}
                                </p>
                                <div className="flex items-center gap-6 text-sm">
                                  <Link
                                    href={`/user/${post.profiles?.username || "unknown"}`}
                                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                                  >
                                    by {post.profiles?.username || "Unknown"}
                                  </Link>
                                  <div className="flex items-center gap-2 text-cyan-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="font-mono">{post.comment_count || 0}</span>
                                    <span>comments</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Enhanced Sidebar */}
              <div className="xl:col-span-1">
                <div className="sticky top-8">
                  <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        About {forum.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {forum.long_description && (
                        <p className="text-gray-300 leading-relaxed">{forum.long_description}</p>
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-cyan-400/20">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Members
                          </span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {(forum.member_count || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-purple-400/20">
                          <span className="text-gray-400 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Posts
                          </span>
                          <span className="text-purple-400 font-mono font-bold">
                            {(forum.post_count || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-600/20">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Created
                          </span>
                          <span className="text-gray-300 font-mono">
                            {new Date(forum.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <Link href={`/forum/${forum.subdomain}/about`}>
                          <Button
                            variant="outline"
                            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 bg-transparent"
                          >
                            View Forum Rules
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Forum page error:", error)
    notFound()
  }
}
