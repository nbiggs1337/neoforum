"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Heart, HeartOff } from "lucide-react"
import { followForum, unfollowForum } from "@/app/actions/forum"
import { toast } from "sonner"

interface FollowForumButtonProps {
  forumId: string
  isFollowing: boolean
}

export function FollowForumButton({ forumId, isFollowing }: FollowForumButtonProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    if (isPending) return

    // Optimistic update
    const previousFollowing = following
    setFollowing(!following)

    startTransition(async () => {
      const result = following ? await unfollowForum(forumId) : await followForum(forumId)

      if (!result.success) {
        // Revert optimistic update
        setFollowing(previousFollowing)
        toast.error(result.error || "Failed to update follow status")
      } else {
        toast.success(following ? "Unfollowed forum" : "Following forum")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={
        following
          ? "border-red-500/50 text-red-400 hover:bg-red-500/20 bg-transparent"
          : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
      }
    >
      {following ? (
        <>
          <HeartOff className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <Heart className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}
