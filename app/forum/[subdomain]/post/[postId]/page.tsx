import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { VoteButtons } from "@/components/vote-buttons"
import { CommentSection } from "@/components/comment-section"
import { ReportDialog } from "@/components/report-dialog"
import { Zap, ArrowLeft, MessageSquare, Share2, Bookmark, Clock, Eye, Edit, Pin, Lock, Calendar, TrendingUp } from 'lucide-react'

interface PostPageProps {
  params: {
    subdomain: string
    postId: string
  }
}

async function getPostData(postId: string, subdomain: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // First get the forum by subdomain
    const { data: forumData, error: forumError } = await supabase
      .from("forums")
      .select("*")
      .eq("subdomain", subdomain)
      .limit(1)

    if (forumError) {
      console.error("Forum fetch error:", forumError)
      return null
    }

    if (!forumData || forumData.length === 0) {
      console.error("Forum not found for subdomain:", subdomain)
      return null
    }

    const forum = forumData[0]

    // Then get the post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("forum_id", forum.id)
      .limit(1)

    if (postError) {
      console.error("Post fetch error:", postError)
      return null
    }

    if (!postData || postData.length === 0) {
      console.error("Post not found:", postId)
      return null
    }

    const post = postData[0]

    // Get author info
    let author = null
    if (post.author_id) {
      const { data: authorData, error: authorError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", post.author_id)
        .limit(1)

      if (authorError) {
        console.error("Author fetch error:", authorError)
      } else if (authorData && authorData.length > 0) {
        author = authorData[0]
      }
    }

    return {
      ...post,
      author: author,
      forum: forum
    }

  } catch (error) {
    console.error("Post data fetch error:", error)
    return null
  }
}

async function getComments(postId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get comments
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Comments fetch error:", error)
      return []
    }

    if (!comments || comments.length === 0) {
      return []
    }

    // Get unique author IDs
    const authorIds = [...new Set(comments.map(c => c.author_id).filter(Boolean))]
    
    if (authorIds.length === 0) {
      return comments.map(comment => ({
        ...comment,
        author: null
      }))
    }

    // Get authors data
    const { data: authors, error: authorsError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", authorIds)

    if (authorsError) {
      console.error("Comment authors fetch error:", authorsError)
      return comments.map(comment => ({
        ...comment,
        author: null
      }))
    }

    // Create authors map
    const authorsMap = (authors || []).reduce((acc, author) => {
      acc[author.id] = author
      return acc
    }, {} as Record<string, any>)

    // Map authors to comments
    return comments.map(comment => ({
      ...comment,
      author: authorsMap[comment.author_id] || null
    }))

  } catch (error) {
    console.error("Comments data fetch error:", error)
    return []
  }
}

async function getUserVotes(postId: string, userId?: string) {
  if (!userId) return { postVote: null, commentVotes: {} }

  try {
    const supabase = await createServerSupabaseClient()

    // Get user's vote on the post
    const { data: postVote, error: postVoteError } = await supabase
      .from("post_votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .limit(1)

    if (postVoteError && postVoteError.code !== 'PGRST116') {
      console.error("Post vote fetch error:", postVoteError)
    }

    // Get user's votes on comments
    const { data: commentVotes, error: commentVotesError } = await supabase
      .from("comment_votes")
      .select("*")
      .eq("user_id", userId)

    if (commentVotesError) {
      console.error("Comment votes fetch error:", commentVotesError)
    }

    const commentVotesMap =
      commentVotes?.reduce(
        (acc, vote) => {
          acc[vote.comment_id] = vote.vote_type
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    return {
      postVote: postVote && postVote.length > 0 ? postVote[0].vote_type : null,
      commentVotes: commentVotesMap,
    }
  } catch (error) {
    console.error("User votes fetch error:", error)
    return { postVote: null, commentVotes: {} }
  }
}

async function incrementViewCount(postId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Simple update query to increment view count
    const { error } = await supabase
      .from("posts")
      .update({ 
        view_count: 1 
      })
      .eq("id", postId)
      .is("view_count", null)

    if (error) {
      // Try to increment existing count
      const { data: currentPost } = await supabase
        .from("posts")
        .select("view_count")
        .eq("id", postId)
        .single()

      if (currentPost) {
        await supabase
          .from("posts")
          .update({ 
            view_count: (currentPost.view_count || 0) + 1 
          })
          .eq("id", postId)
      }
    }
  } catch (error) {
    console.error("View count increment error:", error)
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { subdomain, postId } = params

  let post = null
  let comments = []
  let currentUser = null

  try {
    // Get data with individual try-catch blocks
    try {
      post = await getPostData(postId, subdomain)
    } catch (error) {
      console.error("Failed to get post data:", error)
    }

    if (!post) {
      console.error("Post not found, calling notFound()")
      notFound()
    }

    try {
      comments = await getComments(postId)
    } catch (error) {
      console.error("Failed to get comments:", error)
      comments = []
    }

    try {
      currentUser = await getCurrentUser()
    } catch (error) {
      console.error("Failed to get current user:", error)
    }

    // Increment view count
    try {
      await incrementViewCount(postId)
    } catch (error) {
      console.error("Failed to increment view count:", error)
    }

    const userVotes = await getUserVotes(postId, currentUser?.id)

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    // Check if post has images
    const hasImages = post.image_urls && Array.isArray(post.image_urls) && post.image_urls.length > 0

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Cyberpunk background */}
        <div className="fixed inset-0 cyberpunk-enhanced">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/20"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NeoForum
              </h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/explore">
                <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                  Explore
                </Button>
              </Link>
              <Link href={`/forum/${subdomain}`}>
                <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Forum
                </Button>
              </Link>
              {currentUser ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Enhanced Breadcrumb Navigation */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg px-4 py-3">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Home
              </Link>
              <span className="text-purple-500">/</span>
              <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Explore
              </Link>
              <span className="text-purple-500">/</span>
              <Link
                href={`/forum/${subdomain}`}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                {post.forum?.name || subdomain}
              </Link>
              <span className="text-purple-500">/</span>
              <span className="text-white font-medium truncate max-w-xs">{post.title}</span>
            </nav>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Post Card */}
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-8">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          {post.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                          {post.is_locked && <Lock className="w-4 h-4 text-red-400" />}
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                            {post.forum?.category || "General"}
                          </Badge>
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {(post.upvotes || 0) - (post.downvotes || 0)} score
                          </Badge>
                          {hasImages && (
                            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                              Photo Post
                            </Badge>
                          )}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            {post.author && (
                              <Link href={`/user/${post.author.username}`}>
                                <Avatar className="w-8 h-8 border border-purple-500/30 hover:border-purple-400/50 transition-colors cursor-pointer">
                                  <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-black text-xs font-bold">
                                    {getInitials(post.author.username || "U")}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                {post.author ? (
                                  <Link 
                                    href={`/user/${post.author.username}`}
                                    className="text-white font-medium hover:text-purple-300 transition-colors"
                                  >
                                    {post.author.username}
                                  </Link>
                                ) : (
                                  <span className="text-gray-500">Unknown User</span>
                                )}
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                          {post.updated_at !== post.created_at && (
                            <div className="flex items-center space-x-1">
                              <Edit className="w-4 h-4" />
                              <span>Edited {formatDate(post.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {/* Render images if they exist */}
                    {hasImages && (
                      <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {post.image_urls.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-64 object-cover rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text content */}
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-line text-base">{post.content}</div>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="p-6 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Voting */}
                        <VoteButtons
                          postId={post.id}
                          initialUpvotes={post.upvotes || 0}
                          initialDownvotes={post.downvotes || 0}
                          userVote={userVotes.postVote}
                          disabled={!currentUser}
                        />

                        {/* Engagement Stats - Fixed mobile layout */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{((post.view_count || 0) + 1).toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{comments.length} comments</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <ReportDialog postId={post.id} disabled={!currentUser} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <CommentSection
                postId={postId}
                comments={comments}
                currentUser={currentUser}
                userVotes={userVotes.commentVotes}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Forum Info */}
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 text-lg flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                      {(post.forum?.name || subdomain).charAt(0).toUpperCase()}
                    </div>
                    {post.forum?.name || subdomain}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-400">{post.forum?.description || "Forum description"}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Category</span>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                      {post.forum?.category || "General"}
                    </Badge>
                  </div>
                  <Separator className="bg-gray-800" />
                  <Link href={`/forum/${subdomain}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
                      Visit Forum
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Post Stats */}
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 text-lg">Post Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Views</span>
                    <span className="text-white font-semibold">{((post.view_count || 0) + 1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Upvotes</span>
                    <span className="text-green-400 font-semibold">{post.upvotes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Downvotes</span>
                    <span className="text-red-400 font-semibold">{post.downvotes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Comments</span>
                    <span className="text-white font-semibold">{comments.length}</span>
                  </div>
                  {hasImages && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Images</span>
                      <span className="text-green-400 font-semibold">{post.image_urls.length}</span>
                    </div>
                  )}
                  <Separator className="bg-gray-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Net Score</span>
                    <span className="text-cyan-400 font-semibold text-lg">
                      {(post.upvotes || 0) - (post.downvotes || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Author Info */}
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    {post.author ? (
                      <>
                        <Link href={`/user/${post.author.username}`}>
                          <Avatar className="w-12 h-12 border border-purple-500/30 hover:border-purple-400/50 transition-colors cursor-pointer">
                            <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-black font-bold">
                              {getInitials(post.author.username || "U")}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Link 
                              href={`/user/${post.author.username}`}
                              className="font-semibold text-white hover:text-purple-300 transition-colors"
                            >
                              {post.author.username}
                            </Link>
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {formatDate(post.author.created_at || post.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 border border-gray-500/30">
                          <AvatarFallback className="bg-gray-600 text-gray-300">
                            ?
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-gray-500">Unknown User</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Page render error:", error)
    notFound()
  }
}
