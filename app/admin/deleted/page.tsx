"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Trash2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Globe,
  AlertTriangle,
} from "lucide-react"
import { getDeletedPosts, restorePost, permanentlyDeletePost } from "./actions"

interface DeletedPost {
  id: string
  title: string
  content: string
  author_username: string
  forum_name: string
  forum_subdomain: string
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
}

export default function AdminDeletedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<DeletedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeletedPosts()
  }, [])

  const loadDeletedPosts = async () => {
    try {
      setLoading(true)
      const postsData = await getDeletedPosts()
      setPosts(postsData)
    } catch (error) {
      console.error("Failed to load deleted posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestorePost = async (postId: string) => {
    try {
      await restorePost(postId)
      await loadDeletedPosts() // Refresh data
    } catch (error) {
      console.error("Failed to restore post:", error)
    }
  }

  const handlePermanentlyDeletePost = async (postId: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this post? This action CANNOT be undone and will remove all associated data including votes and comments.",
      )
    ) {
      try {
        await permanentlyDeletePost(postId)
        await loadDeletedPosts() // Refresh data
      } catch (error) {
        console.error("Failed to permanently delete post:", error)
      }
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
          <p className="text-gray-400">Loading deleted content...</p>
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
              <Trash2 className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Deleted Content
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
            Deleted Content Management
          </h2>
          <p className="text-gray-400 text-lg">Restore or permanently delete removed posts</p>
        </div>

        {/* Warning Banner */}
        <Card className="bg-red-900/20 border-red-500/50 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-300 font-semibold">Caution: Permanent Deletion</h3>
                <p className="text-red-200 text-sm">
                  Permanently deleted posts cannot be recovered. This action will remove all associated data including
                  votes and comments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search deleted posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500 w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              {posts.length} Deleted Posts
            </Badge>
            <Button
              onClick={loadDeletedPosts}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Deleted Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">{post.title}</h3>
                      <Badge variant="outline" className="border-red-500/50 text-red-400">
                        DELETED
                      </Badge>
                    </div>

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
                        <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Deleted: {new Date(post.updated_at).toLocaleDateString()}</span>
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
                      className="border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                      onClick={() => handleRestorePost(post.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                      onClick={() => handlePermanentlyDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Forever
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Trash2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No deleted posts found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "No posts have been deleted yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
