'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Heart, UserPlus, Reply } from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    related_post_id?: string
    related_comment_id?: string
    related_forum_id?: string
    related_user_id?: string
    related_user?: {
      id?: string
      username?: string
      display_name?: string
      avatar_url?: string
    }
    related_post?: {
      id?: string
      title?: string
    }
    related_forum?: {
      id?: string
      name?: string
      subdomain?: string
    }
  }
}

async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationId }),
    })
    
    if (!response.ok) {
      console.error('Failed to mark notification as read')
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'comment_on_post':
        return <MessageSquare className="w-4 h-4" />
      case 'reply_to_comment':
        return <Reply className="w-4 h-4" />
      case 'post_like':
      case 'comment_like':
        return <Heart className="w-4 h-4" />
      case 'forum_join':
        return <UserPlus className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getIconColor = () => {
    switch (notification.type) {
      case 'comment_on_post':
      case 'reply_to_comment':
        return 'text-blue-400'
      case 'post_like':
      case 'comment_like':
        return 'text-red-400'
      case 'forum_join':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleClick = async () => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
  }

  const getNotificationLink = () => {
    if (notification.related_post_id && notification.related_forum?.subdomain) {
      return `/forum/${notification.related_forum.subdomain}/post/${notification.related_post_id}`
    }
    if (notification.related_user?.username) {
      return `/user/${notification.related_user.username}`
    }
    return '#'
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
      }
    } catch (error) {
      return 'Recently'
    }
  }

  return (
    <Link href={getNotificationLink()} onClick={handleClick}>
      <Card className={`transition-all duration-200 hover:bg-gray-800/50 cursor-pointer ${
        notification.is_read 
          ? 'bg-gray-900/30 border-gray-700/50' 
          : 'bg-purple-900/20 border-purple-500/30'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full bg-gray-800/50 ${getIconColor()}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {notification.related_user && (
                  <Avatar className="w-6 h-6 border border-purple-500/30">
                    <AvatarImage src={notification.related_user.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-black text-xs font-bold">
                      {getInitials(notification.related_user.username || notification.related_user.display_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium text-white text-sm">
                  {notification.title || 'Notification'}
                </span>
                {!notification.is_read && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                    New
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {notification.message || 'You have a new notification'}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </span>
                
                {notification.related_forum?.name && (
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                    {notification.related_forum.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
