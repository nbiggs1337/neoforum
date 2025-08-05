"use client"

import { useState, useTransition } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { voteOnPost } from "@/app/actions/vote"

interface VoteButtonsProps {
  postId: string
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote?: number | null
}

export function VoteButtons({ postId, initialUpvotes, initialDownvotes, initialUserVote }: VoteButtonsProps) {
  console.log("VoteButtons props:", { postId, initialUpvotes, initialDownvotes, initialUserVote })

  const [upvotes, setUpvotes] = useState(initialUpvotes || 0)
  const [downvotes, setDownvotes] = useState(initialDownvotes || 0)
  const [userVote, setUserVote] = useState<number | null>(initialUserVote || null)
  const [isPending, startTransition] = useTransition()

  const handleVote = async (voteType: number) => {
    console.log("Handling vote:", voteType, "Current user vote:", userVote)

    startTransition(async () => {
      try {
        const result = await voteOnPost(postId, voteType)
        console.log("Vote result:", result)

        if (result.success) {
          setUpvotes(result.upvotes)
          setDownvotes(result.downvotes)
          setUserVote(result.userVote)
          console.log("Updated state:", {
            upvotes: result.upvotes,
            downvotes: result.downvotes,
            userVote: result.userVote,
          })
        } else {
          console.error("Vote failed:", result.error)
        }
      } catch (error) {
        console.error("Vote error:", error)
      }
    })
  }

  const netScore = upvotes - downvotes
  const displayScore = isNaN(netScore) ? 0 : netScore

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`p-1 h-8 w-8 ${
          userVote === 1 ? "text-green-400 bg-green-400/10" : "text-gray-400 hover:text-green-400"
        }`}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium text-green-400 min-w-[2rem] text-center">{displayScore}</span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`p-1 h-8 w-8 ${userVote === -1 ? "text-red-400 bg-red-400/10" : "text-gray-400 hover:text-red-400"}`}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
