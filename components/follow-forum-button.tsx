'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, HeartOff } from 'lucide-react'
import { followForum, unfollowForum } from '@/app/actions/forum'
import { useRouter } from 'next/navigation'

interface FollowForumButtonProps {
  forumId: string
  isFollowing: boolean
  className?: string
}

export function FollowForumButton({ forumId, isFollowing, className }: FollowForumButtonProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleToggleFollow = () => {
    setError(null)
    
    startTransition(async () => {
      try {
        if (following) {
          const result = await unfollowForum(forumId)
          if (result.error) {
            setError(result.error)
            console.error('Unfollow error:', result.error)
          } else {
            setFollowing(false)
            router.refresh()
          }
        } else {
          const result = await followForum(forumId)
          if (result.error) {
            setError(result.error)
            console.error('Follow error:', result.error)
          } else {
            setFollowing(true)
            router.refresh()
          }
        }
      } catch (error) {
        console.error('Toggle follow error:', error)
        setError('An unexpected error occurred')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleToggleFollow}
        disabled={isPending}
        variant={following ? "default" : "outline"}
        size="sm"
        className={className}
      >
        {isPending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : following ? (
          <>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            Following
          </>
        ) : (
          <>
            <HeartOff className="w-4 h-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
