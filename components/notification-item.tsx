import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Heart, UserPlus, Reply } from 'lucide-react'
import { markNotificationAsRead } from '@/app/actions/notifications'

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
      username: string
      avatar_url?: string
    }
    related_post?: {
      title: string
    }
    related_forum?: {
      name: string
      subdomain: string
    }
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
                      {getInitials(notification.related_user.username)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium text-white text-sm">
                  {notification.title}
                </span>
                {!notification.is_read && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                    New
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
                
                {notification.related_forum && (
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
