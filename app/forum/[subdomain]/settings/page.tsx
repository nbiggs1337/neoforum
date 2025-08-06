import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Settings, Shield, Palette, Globe } from 'lucide-react'
import { createServerSupabaseClient } from "@/lib/supabase"
import { ForumSettingsForm } from "@/components/forum-settings-form"
import { ForumModeratorsForm } from "@/components/forum-moderators-form"
import { ForumAppearanceForm } from "@/components/forum-appearance-form"
import { ForumPrivacyForm } from "@/components/forum-privacy-form"

interface ForumSettingsPageProps {
  params: {
    subdomain: string
  }
}

async function getForumSettingsData(subdomain: string) {
  const supabase = await createServerSupabaseClient()

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
      profiles:owner_id(username, display_name, avatar_url)
    `)
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single()

  if (!forum) {
    redirect("/explore")
  }

  // Check if user is owner, admin, or moderator
  const { data: membership } = await supabase
    .from("forum_members")
    .select("role")
    .eq("forum_id", forum.id)
    .eq("user_id", user.id)
    .single()

  const isOwner = forum.owner_id === user.id
  const isAdmin = membership?.role === "admin"
  const isModerator = membership?.role === "moderator"

  // Allow access to owners, admins, and moderators
  if (!isOwner && !isAdmin && !isModerator) {
    redirect(`/forum/${subdomain}`)
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
  const { user, forum, moderators, isOwner, isAdmin, isModerator } = await getForumSettingsData(subdomain)

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
            <p className="text-gray-400">
              Manage your forum settings, appearance, and moderation
              {isModerator && !isAdmin && !isOwner && (
                <span className="ml-2 text-cyan-400">(Moderator Access)</span>
              )}
            </p>
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
              {/* General Settings - Now accessible to moderators */}
              <section id="general">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">General Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your forum's basic information and settings
                      {isModerator && !isAdmin && !isOwner && (
                        <span className="block text-cyan-400 text-sm mt-1">
                          As a moderator, you can edit forum details
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForumSettingsForm forum={forum} />
                  </CardContent>
                </Card>
              </section>

              {/* Appearance Settings - Now accessible to moderators */}
              <section id="appearance">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Appearance</CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your forum's visual appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForumAppearanceForm forum={forum} />
                  </CardContent>
                </Card>
              </section>

              {/* Moderators Section - Only for owners and admins */}
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

              {/* Privacy Settings - Limited access for moderators */}
              <section id="privacy">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Privacy & Access</CardTitle>
                    <CardDescription className="text-gray-400">
                      Control who can access and participate in your forum
                      {isModerator && !isAdmin && !isOwner && (
                        <span className="block text-yellow-400 text-sm mt-1">
                          Limited access - Contact admin for privacy changes
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForumPrivacyForm forum={forum} canEdit={isOwner || isAdmin} />
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
