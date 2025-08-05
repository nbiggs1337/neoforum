import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Settings, Shield, Palette, Globe } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ForumSettingsForm } from "@/components/forum-settings-form"
import { ForumModeratorsForm } from "@/components/forum-moderators-form"

interface ForumSettingsPageProps {
  params: {
    subdomain: string
  }
}

async function getForumSettingsData(subdomain: string) {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get forum data
  const { data: forum } = await supabase
    .from("forums")
    .select(`
      *,
      users!forums_owner_id_fkey(username, display_name, avatar_url)
    `)
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single()

  if (!forum) {
    redirect("/explore")
  }

  // Check if user is owner or admin
  const { data: membership } = await supabase
    .from("forum_members")
    .select("role")
    .eq("forum_id", forum.id)
    .eq("user_id", user.id)
    .single()

  const isOwner = forum.owner_id === user.id
  const isAdmin = membership?.role === "admin"
  const isModerator = membership?.role === "moderator"

  if (!isOwner && !isAdmin && !isModerator) {
    redirect(`/forum/${subdomain}`)
  }

  // Get forum moderators
  const { data: moderators } = await supabase
    .from("forum_members")
    .select(`
      *,
      users!forum_members_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq("forum_id", forum.id)
    .in("role", ["admin", "moderator"])
    .order("joined_at", { ascending: true })

  return {
    user,
    forum,
    moderators: moderators || [],
    isOwner,
    isAdmin,
    isModerator,
  }
}

export default async function ForumSettingsPage({ params }: ForumSettingsPageProps) {
  const { subdomain } = params
  const { user, forum, moderators, isOwner, isAdmin } = await getForumSettingsData(subdomain)

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
            <Link href={`/forum/${subdomain}`} className="text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Forum Settings
              </h1>
            </div>
          </div>
          <Link href={`/forum/${subdomain}`}>
            <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
              Back to Forum
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Forum Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {forum.name} Settings
            </h2>
            <p className="text-gray-400">Manage your forum settings, appearance, and moderation</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <a
                      href="#general"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>General</span>
                    </a>
                    <a
                      href="#appearance"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Appearance</span>
                    </a>
                    {(isOwner || isAdmin) && (
                      <a
                        href="#moderators"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Moderators</span>
                      </a>
                    )}
                    <a
                      href="#privacy"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Privacy</span>
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* General Settings */}
              <section id="general">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">General Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your forum's basic information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForumSettingsForm forum={forum} />
                  </CardContent>
                </Card>
              </section>

              {/* Appearance Settings */}
              <section id="appearance">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Appearance</CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your forum's visual appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Forum Icon</h4>
                          <p className="text-gray-400 text-sm">Upload a custom icon for your forum</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Upload Icon
                        </Button>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Banner Image</h4>
                          <p className="text-gray-400 text-sm">Upload a banner image for your forum</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Upload Banner
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Moderators Section */}
              {(isOwner || isAdmin) && (
                <section id="moderators">
                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-purple-400">Moderators</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage forum moderators and their permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ForumModeratorsForm forum={forum} moderators={moderators} />
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Privacy Settings */}
              <section id="privacy">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Privacy & Access</CardTitle>
                    <CardDescription className="text-gray-400">
                      Control who can access and participate in your forum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Forum Visibility</h4>
                          <p className="text-gray-400 text-sm">
                            {forum.is_private ? "Private - Only members can view" : "Public - Anyone can view"}
                          </p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          {forum.is_private ? "Make Public" : "Make Private"}
                        </Button>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Member Approval</h4>
                          <p className="text-gray-400 text-sm">Require approval for new members</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
