"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, MessageSquare, Globe, AlertTriangle, Shield, Settings, Search, Trash2, Ban, CheckCircle, XCircle, Eye, BarChart3, Flag, UserCheck, Plus } from 'lucide-react'
import {
  getAdminStats,
  getAllUsers,
  getAllForums,
  getAllReports,
  banUser,
  unbanUser,
  deleteUser,
  suspendForum,
  activateForum,
  deleteForum,
  resolveReport,
  dismissReport,
  promoteToAdmin,
  promoteToModerator,
  demoteToUser,
} from "./actions"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalForums: number
  totalPosts: number
  totalReports: number
  pendingApprovals: number
  bannedUsers: number
  dailySignups: number
  dailyPosts: number
  serverUptime: string
  storageUsed: string
  bandwidth: string
}

interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  role: string
  reputation: number
  post_count: number
  is_banned: boolean
  banned_until?: string
  ban_reason?: string
  created_at: string
  updated_at: string
}

interface Forum {
  id: string
  name: string
  subdomain: string
  description?: string
  category: string
  owner_id: string
  owner_username: string
  status: string
  member_count: number
  post_count: number
  is_private: boolean
  created_at: string
  updated_at: string
}

interface Report {
  id: string
  reporter_username: string
  reported_user_username?: string
  post_title?: string
  forum_name?: string
  reason: string
  description?: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [forums, setForums] = useState<Forum[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, usersData, forumsData, reportsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllForums(),
        getAllReports(),
      ])

      setAdminStats(statsData)
      setUsers(usersData)
      setForums(forumsData)
      setReports(reportsData)
    } catch (error) {
      console.error("Failed to load admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      await banUser(userId, reason)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to ban user:", error)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to unban user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId)
        await loadData() // Refresh data
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const handleSuspendForum = async (forumId: string) => {
    try {
      await suspendForum(forumId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to suspend forum:", error)
    }
  }

  const handleActivateForum = async (forumId: string) => {
    try {
      await activateForum(forumId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to activate forum:", error)
    }
  }

  const handleDeleteForum = async (forumId: string) => {
    if (confirm("Are you sure you want to delete this forum? This action cannot be undone.")) {
      try {
        await deleteForum(forumId)
        await loadData() // Refresh data
      } catch (error) {
        console.error("Failed to delete forum:", error)
      }
    }
  }

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveReport(reportId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to resolve report:", error)
    }
  }

  const handleDismissReport = async (reportId: string) => {
    try {
      await dismissReport(reportId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to dismiss report:", error)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await promoteToAdmin(userId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to promote user to admin:", error)
    }
  }

  const handlePromoteToModerator = async (userId: string) => {
    try {
      await promoteToModerator(userId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to promote user to moderator:", error)
    }
  }

  const handleDemoteToUser = async (userId: string) => {
    try {
      await demoteToUser(userId)
      await loadData() // Refresh data
    } catch (error) {
      console.error("Failed to demote user:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500/50 text-green-400"
      case "banned":
      case "suspended":
        return "border-red-500/50 text-red-400"
      case "under_review":
        return "border-yellow-500/50 text-yellow-400"
      case "pending":
        return "border-orange-500/50 text-orange-400"
      case "resolved":
        return "border-green-500/50 text-green-400"
      case "investigating":
        return "border-blue-500/50 text-blue-400"
      default:
        return "border-gray-500/50 text-gray-400"
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredForums = forums.filter(
    (forum) =>
      forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.subdomain.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </Link>
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
            System Administration
          </h2>
          <p className="text-gray-400 text-lg">Manage users, forums, content, and monitor system health</p>
        </div>

        {/* Main Admin Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-black/50 border border-red-500/30 grid grid-cols-6 w-full">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="forums" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
              <Globe className="w-4 h-4 mr-2" />
              Forums
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
              <Flag className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
              <MessageSquare className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300">
              <Settings className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {adminStats && (
              <>
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Users</p>
                          <p className="text-2xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</p>
                          <p className="text-green-400 text-xs">+{adminStats.dailySignups} today</p>
                        </div>
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Active Users</p>
                          <p className="text-2xl font-bold text-white">{adminStats.activeUsers.toLocaleString()}</p>
                          <p className="text-blue-400 text-xs">Last 24h</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Forums</p>
                          <p className="text-2xl font-bold text-white">{adminStats.totalForums}</p>
                          <p className="text-purple-400 text-xs">Active communities</p>
                        </div>
                        <Globe className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Pending Reports</p>
                          <p className="text-2xl font-bold text-white">{adminStats.totalReports}</p>
                          <p className="text-orange-400 text-xs">Needs attention</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Health */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-cyan-400">System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Server Uptime</span>
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          {adminStats.serverUptime}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Storage Used</span>
                        <span className="text-white">{adminStats.storageUsed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Bandwidth (24h)</span>
                        <span className="text-white">{adminStats.bandwidth}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Daily Posts</span>
                        <span className="text-white">{adminStats.dailyPosts.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-red-400">Moderation Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pending Approvals</span>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          {adminStats.pendingApprovals}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Reports</span>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                          {adminStats.totalReports}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Banned Users</span>
                        <span className="text-white">{adminStats.bannedUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Posts</span>
                        <span className="text-white">{adminStats.totalPosts.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500"
                  />
                </div>
              </div>
              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                            <Badge variant="outline" className={getStatusColor(user.is_banned ? "banned" : "active")}>
                              {user.is_banned ? "BANNED" : "ACTIVE"}
                            </Badge>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                              {user.role.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{user.display_name}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            <span>{user.post_count} posts</span>
                            <span>{user.reputation} reputation</span>
                            {user.is_banned && user.ban_reason && (
                              <span className="text-red-400">Reason: {user.ban_reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                          onClick={() => window.open(`/user/${user.username}`, "_blank")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {/* Role Management Buttons */}
                        {user.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-600 text-purple-300 hover:bg-purple-800 bg-transparent"
                            onClick={() => handlePromoteToAdmin(user.id)}
                            title="Promote to Admin"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {user.role === "user" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-300 hover:bg-blue-800 bg-transparent"
                            onClick={() => handlePromoteToModerator(user.id)}
                            title="Promote to Moderator"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {(user.role === "admin" || user.role === "moderator") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-600 text-yellow-300 hover:bg-yellow-800 bg-transparent"
                            onClick={() => handleDemoteToUser(user.id)}
                            title="Demote to User"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        )}

                        {!user.is_banned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                            onClick={() => {
                              const reason = prompt("Enter ban reason:")
                              if (reason) handleBanUser(user.id, reason)
                            }}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Forums Tab */}
          <TabsContent value="forums" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search forums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500"
                  />
                </div>
              </div>
              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {filteredForums.map((forum) => (
                <Card key={forum.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{forum.name}</h3>
                          <Badge variant="outline" className={getStatusColor(forum.status)}>
                            {forum.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                            {forum.category}
                          </Badge>
                          {forum.is_private && (
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                              PRIVATE
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{forum.subdomain}.neoforum.com</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Owner: {forum.owner_username}</span>
                          <span>Created: {new Date(forum.created_at).toLocaleDateString()}</span>
                          <span>{forum.member_count.toLocaleString()} members</span>
                          <span>{forum.post_count.toLocaleString()} posts</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                          onClick={() => window.open(`/forum/${forum.subdomain}`, "_blank")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {forum.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-600 text-yellow-300 hover:bg-yellow-800 bg-transparent"
                            onClick={() => handleSuspendForum(forum.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                            onClick={() => handleActivateForum(forum.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                          onClick={() => handleDeleteForum(forum.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Moderation Reports</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  {reports.filter((r) => r.status === "pending").length} Pending
                </Badge>
                <Button
                  onClick={loadData}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold"
                >
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-gray-500/50 text-gray-400">
                            {report.post_title ? "POST" : report.reported_user_username ? "USER" : "FORUM"}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">
                          {report.post_title || report.reported_user_username || report.forum_name}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Reported by: {report.reporter_username}</span>
                          <span>Reason: {report.reason}</span>
                          <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                          onClick={() => handleResolveReport(report.id)}
                          disabled={report.status === "resolved"}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                          onClick={() => handleDismissReport(report.id)}
                          disabled={report.status === "dismissed"}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-400">Content Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage posts, threads, and other content across all forums
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent h-20 flex-col"
                    onClick={() => window.open("/admin/posts")}
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Manage Posts
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent h-20 flex-col"
                    onClick={() => setSelectedTab("reports")}
                  >
                    <Flag className="w-6 h-6 mb-2" />
                    Flagged Content
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent h-20 flex-col"
                    onClick={() => window.open("/admin/deleted", "_blank")}
                  >
                    <Trash2 className="w-6 h-6 mb-2" />
                    Deleted Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-red-400">System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Name</Label>
                    <Input
                      defaultValue="NeoForum"
                      className="bg-black/50 border-red-500/30 text-white focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Description</Label>
                    <Textarea
                      defaultValue="Build your digital empire with cutting-edge forum technology"
                      className="bg-black/50 border-red-500/30 text-white focus:border-red-500"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-black font-semibold">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-red-400">Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-600 text-yellow-300 hover:bg-yellow-800 bg-transparent"
                    onClick={() => alert("Maintenance mode would be enabled here")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Enable Maintenance Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-300 hover:bg-blue-800 bg-transparent"
                    onClick={() => alert("Reports would be generated here")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                    onClick={() => alert("System check would run here")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Run System Check
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear the cache?")) {
                        alert("Cache would be cleared here")
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
