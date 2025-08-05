import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Zap, ArrowLeft, User, Shield, Bell, Palette } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ProfileForm } from "@/components/profile-form"
import { SecurityForm } from "@/components/security-form"

async function getSettingsData() {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return {
    user,
    profile,
  }
}

export default async function SettingsPage() {
  const { user, profile } = await getSettingsData()

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
                Settings
              </h1>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Account Settings
            </h2>
            <p className="text-gray-400">Manage your profile, security, and preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <a
                      href="#profile"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </a>
                    <a
                      href="#security"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Security</span>
                    </a>
                    <a
                      href="#notifications"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </a>
                    <a
                      href="#appearance"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Appearance</span>
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Section */}
              <section id="profile">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your profile information and how others see you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm user={user} profile={profile} />
                  </CardContent>
                </Card>
              </section>

              {/* Security Section */}
              <section id="security">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Security</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SecurityForm user={user} />
                  </CardContent>
                </Card>
              </section>

              {/* Notifications Section */}
              <section id="notifications">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Notifications</CardTitle>
                    <CardDescription className="text-gray-400">
                      Choose what notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-gray-400 text-sm">Receive notifications via email</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Configure
                        </Button>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Push Notifications</h4>
                          <p className="text-gray-400 text-sm">Receive push notifications in your browser</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Appearance Section */}
              <section id="appearance">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-purple-400">Appearance</CardTitle>
                    <CardDescription className="text-gray-400">Customize how NeoForum looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Theme</h4>
                          <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Cyberpunk Dark
                        </Button>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Animations</h4>
                          <p className="text-gray-400 text-sm">Enable or disable UI animations</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                          Enabled
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
