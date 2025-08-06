import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Users, MessageSquare, Shield, Rocket, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cyberpunk background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  NeoForum
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/health">
                  <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                    Health Check
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Build Your Digital Empire
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Create and manage your own forum community with cutting-edge technology. 
                Connect minds, share ideas, and build the future of online discussion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold px-8 py-4 text-lg"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Building
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-8 py-4 text-lg"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Explore Forums
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Cyberpunk-Powered Communities
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Experience the future of online forums with our advanced platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-purple-300">Community Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Create thriving communities with advanced moderation tools and member management systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-cyan-300">Rich Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Engage in meaningful conversations with voting systems, comments, and real-time interactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-purple-300">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Built with security-first architecture and privacy controls to protect your community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
                Ready to Build the Future?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of community builders creating the next generation of online forums.
              </p>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black font-bold px-12 py-4 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  NeoForum
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-purple-300 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-purple-300 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/support" className="hover:text-purple-300 transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
