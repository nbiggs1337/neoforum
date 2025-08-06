'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { signUpAction } from '@/app/actions/auth'
import { useActionState } from 'react'
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(signUpAction, null)
  const [showPassword, setShowPassword] = useState(false)

  // Show success screen after signup
  if (state?.success) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 cyberpunk-enhanced">
          <div className="absolute inset-0 cyberpunk-bg"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Mail className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to NeoForum!</h2>
              <p className="text-gray-300 mb-4">
                Thank you for joining our community. Your account has been created successfully.
              </p>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-purple-300 text-sm">
                  📧 Please check your email for a verification link to activate your account.
                </p>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Once verified, you'll be able to sign in and start exploring forums, creating posts, and connecting with other users.
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold w-full">
                  Go to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 cyberpunk-enhanced">
        <div className="absolute inset-0 cyberpunk-bg"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center animate-glow">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              NeoForum
            </h1>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent">
                Join the Network
              </CardTitle>
              <CardDescription className="text-gray-400">
                Create your account and start building your digital community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state?.error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm">{state.error}</span>
                </div>
              )}

              <form action={action} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-purple-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                    required
                    disabled={isPending}
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 pr-10"
                      required
                      disabled={isPending}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold py-2"
                  disabled={isPending}
                >
                  {isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
                  ← Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
