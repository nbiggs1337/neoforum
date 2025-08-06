"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Trash2, Eye, ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Calendar, User, Globe, ImageIcon } from 'lucide-react'
import { getAllPosts, deletePost, restorePost } from "./actions"

interface Post {
  id: string
  title: string
  content: string
  author_username: string
  forum_name: string
  forum_subdomain: string
  upvotes: number
  downvotes: number
  status: string
  created_at: string
  updated_at: string
  image_urls: string[] | null
}

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const postsData = await getAllPosts()
      setPosts(postsData)
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (
      confirm("Are you sure you want to delete this post? This action can be undone from the deleted content page.")
    ) {
      try {
        await deletePost(postId)
        await loadPosts() // Refresh data
      } catch (error) {
        console.error("Failed to delete post:", error)
      }
    }
  }

  const handleRestorePost = async (postId: string) => {
    try {
      await restorePost(postId)
      await loadPosts() // Refresh data
    } catch (error) {
      console.error("Failed to restore post:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "border-green-500/50 text-green-400"
      case "deleted":
        return "border-red-500/50 text-red-400"
      case "draft":
        return "border-yellow-500/50 text-yellow-400"
      default:
        return "border-gray-500/50 text-gray-400"
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.forum_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading posts...</p>
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
            <Link href="/admin" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-red-400" />
              <span className="text-red-300 hover:text-white">Back to Admin</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Post Management
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              ADMIN ACCESS
            </Badge>
            <Link href="/">
              <Button variant="ghost" className="text-red-300 hover:text-white hover:bg-red-500/20">
                Back to Site
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Manage All Posts
          </h2>
          <p className="text-gray-400 text-lg">View, moderate, and manage posts across all forums</p>
        </div>

        {/* Search and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts, authors, or forums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500 w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              {posts.filter((p) => p.status === "published").length} Published
            </Badge>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              {posts.filter((p) => p.status === "deleted").length} Deleted
            </Badge>
            <Button
              onClick={loadPosts}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasImages = Array.isArray(post.image_urls) && post.image_urls.length > 0
            const displayImages = hasImages ? post.image_urls.slice(0, 3) : []
            const remainingImages = hasImages ? Math.max(0, post.image_urls.length - 3) : 0

            return (
              <Card key={post.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{post.title}</h3>
                        <Badge variant="outline" className={getStatusColor(post.status)}>
                          {post.status.toUpperCase()}
                        </Badge>
                        {hasImages && (
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Photo Post
                          </Badge>
                        )}
                      </div>

                      {/* Image Preview Grid */}
                      {hasImages && (
                        <div className="grid grid-cols-3 gap-2 mb-3 max-w-md">
                          {displayImages.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-full object-cover rounded border border-purple-500/30 hover:border-purple-400/60 transition-colors"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                              {index === 2 && remainingImages > 0 && (
                                <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">+{remainingImages}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{post.author_username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{post.forum_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3 text-green-400" />
                            <span>{post.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="w-3 h-3 text-red-400" />
                            <span>{post.downvotes}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        onClick={() => window.open(`/forum/${post.forum_subdomain}/post/${post.id}`, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {post.status === "published" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                          onClick={() => handleRestorePost(post.id)}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredPosts.length === 0 && (
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "No posts have been created yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
