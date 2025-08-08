'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Reply, ArrowUp, ArrowDown, Flag, Heart, Clock } from 'lucide-react'
import { createComment } from "@/app/actions/comment"
import { voteOnComment } from "@/app/actions/comment-vote"

interface Comment {
  id: string
  content: string
  created_at: string
  upvotes: number
  downvotes: number
  author: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }
}

interface CommentSectionProps {
  postId: string
  comments?: Comment[]
  currentUser?: any
  userVotes?: Record<string, number>
}

export function CommentSection({ postId, comments = [], currentUser, userVotes = {} }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({})
  const [commentVotes, setCommentVotes] = useState<
    Record<string, { upvotes: number; downvotes: number; userVote: string | null }>
  >(
    (comments || []).reduce(
      (acc, comment) => {
        acc[comment.id] = {
          upvotes: comment.upvotes || 0,
          downvotes: comment.downvotes || 0,
          userVote: userVotes[comment.id] === 1 ? "upvote" : userVotes[comment.id] === -1 ? "downvote" : null,
        }
        return acc
      },
      {} as Record<string, { upvotes: number; downvotes: number; userVote: string | null }>,
    ),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const linkifyContent = (text: string) => {
    // First handle URLs
    let linkedText = text.replace(
      /(https?:\/\/[^\s]+|ftp:\/\/[^\s]+|www\.[^\s]+)/gi,
      (url) => {
        const href = url.startsWith('www.') ? `https://${url}` : url
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-colors">${url}</a>`
      }
    )
    
    // Then handle @usernames
    linkedText = linkedText.replace(
      /@([a-zA-Z0-9_]+)/g,
      '<a href="/user/$1" class="text-purple-400 hover:text-purple-300 underline hover:no-underline transition-colors">@$1</a>'
    )
    
    return linkedText
  }

  const handleVote = async (commentId: string, voteType: "upvote" | "downvote") => {
    if (!currentUser || votingStates[commentId]) return

    const currentVote = commentVotes[commentId]?.userVote
    const newVoteType = currentVote === voteType ? null : voteType

    // Set voting state to prevent double clicks
    setVotingStates(prev => ({ ...prev, [commentId]: true }))

    // Store original state for rollback
    const originalState = commentVotes[commentId] || { upvotes: 0, downvotes: 0, userVote: null }

    // Optimistic update
    setCommentVotes((prev) => {
      const current = prev[commentId] || { upvotes: 0, downvotes: 0, userVote: null }
      let newUpvotes = current.upvotes
      let newDownvotes = current.downvotes

      // Remove previous vote
      if (current.userVote === "upvote") newUpvotes = Math.max(0, newUpvotes - 1)
      if (current.userVote === "downvote") newDownvotes = Math.max(0, newDownvotes - 1)

      // Add new vote
      if (newVoteType === "upvote") newUpvotes++
      if (newVoteType === "downvote") newDownvotes++

      return {
        ...prev,
        [commentId]: {
          upvotes: Math.max(0, newUpvotes),
          downvotes: Math.max(0, newDownvotes),
          userVote: newVoteType,
        },
      }
    })

    try {
      const result = await voteOnComment(commentId, newVoteType)
      
      if (result.success) {
        // Update with server response
        setCommentVotes((prev) => ({
          ...prev,
          [commentId]: {
            upvotes: result.upvotes || 0,
            downvotes: result.downvotes || 0,
            userVote: result.userVote === 1 ? "upvote" : result.userVote === -1 ? "downvote" : null,
          },
        }))
      } else {
        console.error("Vote failed:", result.error)
        // Revert to original state on error
        setCommentVotes((prev) => ({
          ...prev,
          [commentId]: originalState,
        }))
      }
    } catch (error) {
      console.error("Error voting on comment:", error)
      // Revert to original state on error
      setCommentVotes((prev) => ({
        ...prev,
        [commentId]: originalState,
      }))
    } finally {
      // Clear voting state
      setVotingStates(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser || isSubmitting) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("postId", postId)
      formData.append("content", newComment.trim())

      await createComment(formData)
      setNewComment("")
      // Refresh the page to show the new comment
      window.location.reload()
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || !currentUser || isSubmitting) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("postId", postId)
      formData.append("content", replyText.trim())
      formData.append("parentId", commentId)

      await createComment(formData)
      setReplyText("")
      setReplyingTo(null)
      // Refresh the page to show the new reply
      window.location.reload()
    } catch (error) {
      console.error("Error creating reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartReply = (commentId: string, username: string) => {
    setReplyingTo(commentId)
    setReplyText(`@${username} `)
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {currentUser ? (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 border border-purple-500/30">
                <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-black text-xs font-bold">
                  {getInitials(currentUser.username || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 mb-3 resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 text-center">
            <p className="text-gray-400 mb-3">Sign in to join the discussion</p>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
            >
              <a href="/login">Sign In</a>
            </Button>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No comments yet</h3>
            <p className="text-gray-500">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const voteData = commentVotes[comment.id] || {
              upvotes: comment.upvotes || 0,
              downvotes: comment.downvotes || 0,
              userVote: null,
            }
            const netScore = voteData.upvotes - voteData.downvotes
            const isVoting = votingStates[comment.id] || false

            return (
              <div key={comment.id}>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-start space-x-3">
                    {/* Voting */}
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, "upvote")}
                        className={`p-1 ${
                          voteData.userVote === "upvote"
                            ? "text-green-400 bg-green-500/20"
                            : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                        }`}
                        disabled={!currentUser || isVoting}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <span
                        className={`text-sm font-semibold ${
                          netScore > 0 ? "text-green-400" : netScore < 0 ? "text-red-400" : "text-white"
                        }`}
                      >
                        {netScore}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, "downvote")}
                        className={`p-1 ${
                          voteData.userVote === "downvote"
                            ? "text-red-400 bg-red-500/20"
                            : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        }`}
                        disabled={!currentUser || isVoting}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6 border border-purple-500/30">
                          <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-black text-xs font-bold">
                            {getInitials(comment.author.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{comment.author.username}</span>
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                      <div 
                        className="text-gray-300 mb-3 whitespace-pre-line leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: linkifyContent(comment.content) }}
                      />
                      <div className="flex items-center space-x-4">
                        {currentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartReply(comment.id, comment.author.username)}
                            className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 text-xs"
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs"
                          disabled={!currentUser}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Like
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 text-xs"
                          disabled={!currentUser}
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          Report
                        </Button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && currentUser && (
                        <div className="mt-4 bg-black/50 rounded-lg p-3 border border-gray-700">
                          <Textarea
                            placeholder={`Reply to ${comment.author.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 mb-2 resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyText.trim() || isSubmitting}
                              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold disabled:opacity-50"
                            >
                              {isSubmitting ? "Replying..." : "Reply"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < comments.length - 1 && <Separator className="bg-gray-800" />}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
