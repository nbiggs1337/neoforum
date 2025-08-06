import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Mail, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SupportMessagesList } from './support-messages-list'
import { getSupportMessages } from '@/app/actions/support'

export default async function AdminSupportPage() {
  const result = await getSupportMessages()
  
  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{result.error}</p>
        </div>
      </div>
    )
  }

  const messages = result.data || []
  const openMessages = messages.filter(m => m.status === 'open')
  const inProgressMessages = messages.filter(m => m.status === 'in_progress')
  const resolvedMessages = messages.filter(m => m.status === 'resolved')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Support
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                Back to Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Support Messages</h1>
          <p className="text-gray-400">Manage and respond to user support requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Open</p>
                  <p className="text-2xl font-bold text-white">{openMessages.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-white">{inProgressMessages.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-white">{resolvedMessages.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-white">{messages.length}</p>
                </div>
                <Mail className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Messages List */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-400">Support Messages</CardTitle>
            <CardDescription className="text-gray-400">
              View and manage all support requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            }>
              <SupportMessagesList messages={messages} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
