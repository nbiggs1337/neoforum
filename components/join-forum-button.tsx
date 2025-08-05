"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { joinForum, leaveForum } from "@/app/actions/forum"
import { Users, UserPlus, UserMinus } from "lucide-react"

interface JoinForumButtonProps {
  forumId: string
  isJoined: boolean
  memberCount: number
}

export function JoinForumButton({ forumId, isJoined, memberCount = 0 }: JoinForumButtonProps) {
  const [joined, setJoined] = useState(isJoined)
  const [loading, setLoading] = useState(false)
  const [currentMemberCount, setCurrentMemberCount] = useState(memberCount)

  const handleJoinLeave = async () => {
    setLoading(true)
    try {
      if (joined) {
        const result = await leaveForum(forumId)
        if (result.success) {
          setJoined(false)
          setCurrentMemberCount((prev) => Math.max(0, prev - 1))
        } else {
          console.error("Leave forum error:", result.error)
        }
      } else {
        const result = await joinForum(forumId)
        if (result.success) {
          setJoined(true)
          setCurrentMemberCount((prev) => prev + 1)
        } else {
          console.error("Join forum error:", result.error)
        }
      }
    } catch (error) {
      console.error("Join/Leave forum error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-gray-400">
        <Users className="w-4 h-4" />
        <span className="text-sm">{currentMemberCount.toLocaleString()} members</span>
      </div>
      <Button
        onClick={handleJoinLeave}
        disabled={loading}
        variant={joined ? "outline" : "default"}
        className={
          joined
            ? "border-red-500/30 text-red-400 hover:bg-red-900/20"
            : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
        }
      >
        {loading ? (
          "Loading..."
        ) : joined ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Leave
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Join
          </>
        )}
      </Button>
    </div>
  )
}
