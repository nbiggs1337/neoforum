import { Suspense } from 'react'
import Link from 'next/link'
import { Bell, Zap, ArrowLeft, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationItem } from '@/components/notification-item'
import { getNotifications, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function NotificationsList() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  const { notifications } = await getNotifications()

  const handleMarkAllAsRead = async () => {
    'use server'
    await markAllNotificationsAsRead()
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-400 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications ({notifications.length})
          </CardTitle>
          {notifications.some(n => !n.is_read) && (
            <form action={handleMarkAllAsRead}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </form>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No notifications yet</h3>
            <p className="text-gray-500">When you get notifications, they'll appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cyberpunk background */}
      <div className="fixed inset-0 cyberpunk-enhanced">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/20"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              NeoForum
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Notifications
            </h1>
            <p className="text-gray-400">Stay updated with the latest activity</p>
          </div>

          <Suspense fallback={
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notifications...</p>
              </CardContent>
            </Card>
          }>
            <NotificationsList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
