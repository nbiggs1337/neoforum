import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Search, Trash2, ExternalLink, Users, ThumbsUp, Building2 } from 'lucide-react'
import { createServerSupabaseClient } from "@/lib/supabase"
import { deleteComment } from "./actions"

async function getCommentsData(searchQuery?: string) {
  const supabase = await createServerSupabaseClient()

  // Get current user and verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Build query for comments with better error handling
  try {
    let query = supabase
      .from("comments")
      .select(`
        *,
        profiles!comments_user_id_fkey(username, display_name, avatar_url),
        posts!comments_post_id_fkey(
          title,
          id,
          forums!posts_forum_id_fkey(name, subdomain)
        )
      `)
      .order("created_at", { ascending: false })

    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`content.ilike.%${searchQuery}%,profiles.username.ilike.%${searchQuery}%,profiles.display_name.ilike.%${searchQuery}%,posts.title.ilike.%${searchQuery}%`)
    }

    const { data: comments, error } = await query.limit(100)

    if (error) {
      console.error("Error fetching comments:", error)
      return { comments: [], stats: { total: 0, authors: 0, upvotes: 0, forums: 0 } }
    }

    // Calculate statistics
    const uniqueAuthors = new Set(comments?.map(c => c.user_id) || []).size
    const totalUpvotes = comments?.reduce((sum, c) => sum + (c.upvotes || 0), 0) || 0
    const uniqueForums = new Set(comments?.map(c => c.posts?.forums?.subdomain).filter(Boolean) || []).size

    return {
      comments: comments || [],
      stats: {
        total: comments?.length || 0,
        authors: uniqueAuthors,
        upvotes: totalUpvotes,
        forums: uniqueForums,
      },
    }
  } catch (error) {
    console.error("Unexpected error fetching comments:", error)
    return { comments: [], stats: { total: 0, authors: 0, upvotes: 0, forums: 0 } }
  }
}

interface AdminCommentsPageProps {
  searchParams: {
    search?: string
  }
}

export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
  const { comments, stats } = await getCommentsData(searchParams.search)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated nightscape background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Comment Management
            </h1>
          </div>
          <p className="text-gray-400">View and manage all comments across all forums</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-gray-400 text-sm">Total Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.authors}</p>
                  <p className="text-gray-400 text-sm">Unique Authors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ThumbsUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.upvotes}</p>
                  <p className="text-gray-400 text-sm">Total Upvotes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.forums}</p>
                  <p className="text-gray-400 text-sm">Active Forums</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <form method="GET" className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="search"
                  placeholder="Search comments, authors, posts, or forums..."
                  defaultValue={searchParams.search}
                  className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Search
              </Button>
              {searchParams.search && (
                <Link href="/admin/comments">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    Clear
                  </Button>
                </Link>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-400">
              All Comments {searchParams.search && `(filtered by "${searchParams.search}")`}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {comments.length} comment{comments.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No comments found</h3>
                <p className="text-gray-500">
                  {searchParams.search ? "Try adjusting your search terms" : "No comments have been posted yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-700 rounded-lg p-6 bg-gray-900/30">
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                          {comment.profiles?.avatar_url ? (
                            <img
                              src={comment.profiles.avatar_url || "/placeholder.svg"}
                              alt={comment.profiles.display_name || comment.profiles.username}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-black font-semibold">
                              {(comment.profiles?.display_name || comment.profiles?.username || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {comment.profiles?.display_name || comment.profiles?.username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-400">
                            @{comment.profiles?.username || 'unknown'} • {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {comment.upvotes || 0} upvotes
                        </Badge>
                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                          {comment.downvotes || 0} downvotes
                        </Badge>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="mb-4">
                      <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    {/* Post Context */}
                    {comment.posts && (
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400 mb-1">Comment on post:</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{comment.posts.title}</p>
                            {comment.posts.forums && (
                              <p className="text-sm text-purple-400">
                                in r/{comment.posts.forums.subdomain} ({comment.posts.forums.name})
                              </p>
                            )}
                          </div>
                          {comment.posts.forums && (
                            <Link
                              href={`/forum/${comment.posts.forums.subdomain}/post/${comment.posts.id}`}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>ID: {comment.id}</span>
                        <span>Score: {(comment.upvotes || 0) - (comment.downvotes || 0)}</span>
                      </div>
                      <form action={deleteComment}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
