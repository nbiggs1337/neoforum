import { createServerSupabaseClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, MessageSquare, Plus } from 'lucide-react'
import Link from "next/link"
import { ExploreClient } from "@/components/explore-client"

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient()
  const currentUser = await getCurrentUser()

  console.log('Explore page - Current user:', currentUser?.id)

  // Get all public forums
  const { data: forums } = await supabase
    .from("forums")
    .select(`
      id,
      name,
      subdomain,
      description,
      category,
      member_count,
      post_count,
      created_at,
      owner_id
    `)
    .eq("status", "active")
    .eq("is_private", false)
    .order("member_count", { ascending: false })

  // Get owner usernames separately
  let forumsWithOwners = forums || []
  if (forums && forums.length > 0) {
    const ownerIds = [...new Set(forums.map((f) => f.owner_id))]
    const { data: owners } = await supabase.from("profiles").select("id, username").in("id", ownerIds)

    const ownerMap = new Map(owners?.map((owner) => [owner.id, owner.username]) || [])

    forumsWithOwners = forums.map((forum) => ({
      ...forum,
      owner_username: ownerMap.get(forum.owner_id) || "Unknown",
    }))
  }

  // Get user relationships separately if user is logged in
  let userMemberships = []
  let userFollows = []

  if (currentUser && forumsWithOwners.length > 0) {
    const forumIds = forumsWithOwners.map((f) => f.id)

    const [membershipsResult, followsResult] = await Promise.all([
      supabase.from("forum_members").select("forum_id, role").eq("user_id", currentUser.id).in("forum_id", forumIds),
      supabase.from("forum_follows").select("forum_id").eq("user_id", currentUser.id).in("forum_id", forumIds),
    ])

    userMemberships = membershipsResult.data || []
    userFollows = followsResult.data || []

    console.log('User memberships:', userMemberships)
    console.log('User follows:', userFollows)
  }

  // Process forums data to include user relationships
  const processedForums = forumsWithOwners.map((forum) => {
    const membership = userMemberships.find((m) => m.forum_id === forum.id)
    const follow = userFollows.find((f) => f.forum_id === forum.id)

    return {
      ...forum,
      owner_display_name: forum.owner_username,
      user_membership: membership || null,
      user_follow: follow ? { id: follow.forum_id } : null,
      is_owner: currentUser ? forum.owner_id === currentUser.id : false,
    }
  })

  console.log('Processed forums sample:', processedForums[0])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cyberpunk background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.1) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Explore Forums
            </h1>
            <p className="text-gray-400 text-lg">Discover communities and join the conversation</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                Dashboard
              </Button>
            </Link>
            {currentUser && (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Forum
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-800 rounded text-sm">
            <p>Current User ID: {currentUser?.id || 'Not logged in'}</p>
            <p>Forums count: {processedForums.length}</p>
            <p>User memberships: {userMemberships.length}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{forumsWithOwners?.length || 0}</p>
                  <p className="text-gray-400">Active Forums</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {forumsWithOwners?.reduce((sum, forum) => sum + forum.member_count, 0).toLocaleString() || 0}
                  </p>
                  <p className="text-gray-400">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {forumsWithOwners?.reduce((sum, forum) => sum + forum.post_count, 0).toLocaleString() || 0}
                  </p>
                  <p className="text-gray-400">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forums */}
        <ExploreClient initialForums={processedForums} currentUserId={currentUser?.id} />
      </div>
    </div>
  )
}
