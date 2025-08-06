"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Trash2, Eye, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react'
import { getAllComments, deleteComment } from "./actions"

interface Comment {
  id: string
  content: string
  author_id: string
  author_username: string
  author_avatar: string
  post_id: string
  post_title: string
  forum_name: string
  forum_subdomain: string
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      setLoading(true)
      const commentsData = await getAllComments()
      setComments(commentsData)
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      try {
        await deleteComment(commentId)
        await loadComments() // Refresh data
      } catch (error) {
        console.error("Failed to delete comment:", error)
      }
    }
  }

  const filteredComments = comments.filter(
    (comment) =>
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.post_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.forum_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated nightscape background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-red-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 text-red-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin</span>
            </Link>
            <div className="w-px h-6 bg-red-500/30"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Comment Management
            </h1>
          </div>
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            {filteredComments.length} Comments
          </Badge>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search comments, authors, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500 w-80"
              />
            </div>
          </div>
          <Button
            onClick={loadComments}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
          >
            Refresh
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Comments Found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "No comments match your search criteria." : "No comments have been posted yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <Card key={comment.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Comment Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author_avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.author_username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-white font-medium">{comment.author_username}</span>
                          <span className="text-gray-500">commented on</span>
                          <Link
                            href={`/forum/${comment.forum_subdomain}/post/${comment.post_id}`}
                            className="text-red-400 hover:text-red-300 font-medium"
                          >
                            {comment.post_title}
                          </Link>
                          <span className="text-gray-500">in</span>
                          <Link
                            href={`/forum/${comment.forum_subdomain}`}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {comment.forum_name}
                          </Link>
                        </div>
                      </div>

                      {/* Comment Content */}
                      <div className="bg-gray-900/50 rounded-lg p-4 mb-3">
                        <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                      </div>

                      {/* Comment Metadata */}
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.upvotes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsDown className="w-3 h-3" />
                          <span>{comment.downvotes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>ID: {comment.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        onClick={() => window.open(`/forum/${comment.forum_subdomain}/post/${comment.post_id}`, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredComments.length > 0 && (
          <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-red-400 text-lg">Comment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{filteredComments.length}</p>
                  <p className="text-gray-400 text-sm">Total Comments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(filteredComments.map(c => c.author_id)).size}
                  </p>
                  <p className="text-gray-400 text-sm">Unique Authors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {filteredComments.reduce((sum, c) => sum + c.upvotes, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Upvotes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(filteredComments.map(c => c.forum_subdomain)).size}
                  </p>
                  <p className="text-gray-400 text-sm">Forums</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
