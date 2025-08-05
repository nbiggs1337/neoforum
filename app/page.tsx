import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Users, Globe, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple cyberpunk grid background */}
      <div className="fixed inset-0 cyberpunk-enhanced">
        <div className="absolute inset-0 cyberpunk-bg"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center animate-glow">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              NeoForum
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-float">
              Build Your Digital Empire
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Create and manage your own forum community with cutting-edge technology. Connect minds, share ideas, and
              build the future of online discussion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold px-8 py-3 text-lg animate-glow"
                >
                  Start Building
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/20 px-8 py-3 text-lg bg-transparent"
                >
                  Explore Forums
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/60 transition-all duration-300 hover:animate-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Custom URLs
</h3>
                <p className="text-gray-400">Get your own subdomain and brand your community</p>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300 hover:animate-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Community Tools</h3>
                <p className="text-gray-400">Advanced moderation and user management features</p>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm hover:border-green-500/60 transition-all duration-300 hover:animate-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Built with Next.js for optimal performance</p>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300 hover:animate-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
                <p className="text-gray-400">Enterprise-grade security and data protection</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30 backdrop-blur-sm animate-glow">
            <CardContent className="p-12 text-center">
              <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Launch Your Community?
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of creators building the next generation of online communities
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold px-12 py-4 text-lg"
                >
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/30 bg-black/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded"></div>
              <span className="text-gray-400">© 2024 NeoForum. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                Terms
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-purple-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
