import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Zap, Users, MessageSquare, Calendar, Globe, ExternalLink, Shield, BookOpen, Edit, Award, LinkIcon, ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from "@/lib/supabase"

interface AboutPageProps {
  params: {
    subdomain: string
  }
}

async function getForumAboutData(subdomain: string) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get forum data with owner info - check both active and inactive forums
  const { data: forum } = await supabase
    .from("forums")
    .select(`
      *,
      profiles!forums_owner_id_fkey(username, display_name, avatar_url, created_at)
    `)
    .eq("subdomain", subdomain)
    .single()

  if (!forum) {
    redirect("/explore")
  }

  // Get forum moderators
  const { data: moderators } = await supabase
    .from("forum_members")
    .select(`
      *,
      profiles:user_id(username, display_name, avatar_url)
    `)
    .eq("forum_id", forum.id)
    .in("role", ["admin", "moderator"])
    .order("joined_at", { ascending: true })

  // Check if current user is mod/admin
  let userRole = null
  if (user) {
    if (forum.owner_id === user.id) {
      userRole = "owner"
    } else {
      const { data: membership } = await supabase
        .from("forum_members")
        .select("role")
        .eq("forum_id", forum.id)
        .eq("user_id", user.id)
        .single()

      userRole = membership?.role || "member"
    }
  }

  // Get recent activity stats
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("created_at")
    .eq("forum_id", forum.id)
    .eq("status", "published")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: activeMembers } = await supabase.from("forum_members").select("user_id").eq("forum_id", forum.id)

  return {
    forum,
    moderators: moderators || [],
    userRole,
    weeklyPosts: recentPosts?.length || 0,
    totalMembers: activeMembers?.length || 0,
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { subdomain } = params
  const { forum, moderators, userRole, weeklyPosts, totalMembers } = await getForumAboutData(subdomain)

  const isModOrAdmin = userRole === "owner" || userRole === "admin" || userRole === "moderator"

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Mock resources and achievements for now - these could be stored in database
  const resources = [
    {
      id: 1,
      title: "Community Guidelines",
      description: "Essential rules and guidelines for community members",
      url: `/forum/${subdomain}/guidelines`,
      category: "Guidelines",
      isInternal: true,
    },
    {
      id: 2,
      title: "Getting Started Guide",
      description: "New member orientation and getting started tips",
      url: `/forum/${subdomain}/getting-started`,
      category: "Help",
      isInternal: true,
    },
  ]

  const achievements = [
    {
      id: 1,
      title: "Community Milestone",
      description: `Reached ${totalMembers} active members`,
      date: formatDate(forum.created_at),
      icon: "🎉",
    },
    {
      id: 2,
      title: "Active Community",
      description: `${weeklyPosts} posts this week`,
      date: new Date().toLocaleDateString(),
      icon: "📈",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated nightscape background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NeoForum
              </h1>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href={`/forum/${subdomain}`}>
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                Back to Forum
              </Button>
            </Link>
            {isModOrAdmin && (
              <Link href={`/forum/${subdomain}/settings`}>
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Forum Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20 border-2 border-purple-500/30">
              <AvatarImage src={forum.icon_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-black font-bold text-2xl">
                {forum.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {forum.name}
              </h2>
              <p className="text-gray-400 text-lg mb-2">{forum.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>neoforum.com/forum/{forum.subdomain}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(forum.created_at)}</span>
                </div>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  {forum.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  About This Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {forum.long_description ||
                    forum.description ||
                    "Welcome to our community! This forum is a place for meaningful discussions and connections."}
                </p>
              </CardContent>
            </Card>

            {/* Community Rules */}
            {forum.rules && (
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Community Rules
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Please read and follow these guidelines to maintain a positive community environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">{forum.rules}</div>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Helpful Resources
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Curated links and resources for community members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white">{resource.title}</h4>
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                            {resource.category}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{resource.description}</p>
                        <Link
                          href={resource.url}
                          className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                          target={resource.isInternal ? "_self" : "_blank"}
                        >
                          {resource.isInternal ? "View Guide" : "Visit Resource"}
                          {!resource.isInternal && <ExternalLink className="w-3 h-3 ml-1" />}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Community Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4 bg-gray-900/50 rounded-lg p-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{achievement.title}</h4>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{forum.member_count.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm flex items-center justify-center">
                      <Users className="w-3 h-3 mr-1" />
                      Members
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{forum.post_count.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{forum.thread_count.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Threads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{weeklyPosts}</div>
                    <div className="text-gray-400 text-sm">This Week</div>
                  </div>
                </div>
                <Separator className="bg-gray-800" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Forum Status</span>
                    <span className="text-green-400 capitalize">{forum.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Privacy</span>
                    <span className="text-white">{forum.is_private ? "Private" : "Public"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forum Owner */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Forum Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/user/${forum.profiles?.username}`} className="block hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={forum.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{forum.profiles?.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white hover:text-purple-300 transition-colors">{forum.profiles?.display_name || forum.profiles?.username}</h4>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                          Owner
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-xs">@{forum.profiles?.username}</p>
                      <p className="text-gray-500 text-xs">Joined {formatDate(forum.profiles?.created_at)}</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Moderators */}
            {moderators.length > 0 && (
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400">Moderators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moderators.map((mod) => (
                    <Link key={mod.id} href={`/user/${mod.profiles?.username}`} className="block hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={mod.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{mod.profiles?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-white text-sm hover:text-purple-300 transition-colors">
                              {mod.profiles?.display_name || mod.profiles?.username}
                            </h5>
                            <Badge
                              variant="outline"
                              className={
                                mod.role === "admin"
                                  ? "border-red-500/50 text-red-400 text-xs"
                                  : "border-blue-500/50 text-blue-400 text-xs"
                              }
                            >
                              {mod.role}
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-xs">@{mod.profiles?.username}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
