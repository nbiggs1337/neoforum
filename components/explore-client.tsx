"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, MessageSquare, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { JoinForumButton } from "./join-forum-button"
import { FollowForumButton } from "./follow-forum-button"

interface Forum {
  id: string
  name: string
  subdomain: string
  description: string
  category: string
  member_count: number
  post_count: number
  created_at: string
  owner_display_name: string
  user_membership?: {
    role: string
  } | null
  user_follow?: {
    id: string
  } | null
  is_owner?: boolean
}

interface ExploreClientProps {
  initialForums: Forum[]
  currentUserId?: string
}

export function ExploreClient({ initialForums, currentUserId }: ExploreClientProps) {
  const [forums, setForums] = useState(initialForums)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("members")

  // Get unique categories
  const categories = Array.from(new Set(forums.map((forum) => forum.category)))

  // Filter and sort forums
  const filteredForums = forums
    .filter((forum) => {
      const matchesSearch =
        forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || forum.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.member_count - a.member_count
        case "posts":
          return b.post_count - a.post_count
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search forums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-purple-500/30 text-white placeholder-gray-400"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-black/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-black border-purple-500/30">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-black/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black border-purple-500/30">
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="posts">Most Posts</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForums.map((forum) => (
          <Card
            key={forum.id}
            className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/60 transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-white mb-2">
                    <Link href={`/forum/${forum.subdomain}`} className="hover:text-purple-400 transition-colors">
                      {forum.name}
                    </Link>
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-300 mb-2">
                    {forum.category}
                  </Badge>
                </div>
                {currentUserId && <FollowForumButton forumId={forum.id} isFollowing={!!forum.user_follow} />}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{forum.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{forum.member_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{forum.post_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">by {forum.owner_display_name}</div>
                {currentUserId && (
                  <JoinForumButton
                    forumId={forum.id}
                    isMember={!!forum.user_membership}
                    memberCount={forum.member_count}
                    isOwner={forum.is_owner}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForums.length === 0 && (
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No forums found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
