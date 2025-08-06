"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus } from 'lucide-react'
import { addForumModerator, removeForumModerator, updateModeratorRole } from "@/app/actions/forum"
import { useRouter } from "next/navigation"

interface ForumModeratorsFormProps {
  forum: any
  moderators: any[]
}

export function ForumModeratorsForm({ forum, moderators }: ForumModeratorsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newModeratorUsername, setNewModeratorUsername] = useState("")
  const [newModeratorRole, setNewModeratorRole] = useState<"moderator" | "admin">("moderator")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleAddModerator = async () => {
    if (!newModeratorUsername.trim()) {
      setError("Please enter a username")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await addForumModerator(forum.id, newModeratorUsername.trim(), newModeratorRole)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully added ${newModeratorUsername} as ${newModeratorRole}`)
        setNewModeratorUsername("")
        router.refresh()
      }
    } catch (error) {
      setError("Failed to add moderator")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveModerator = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} as a moderator?`)) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await removeForumModerator(forum.id, userId)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully removed ${username}`)
        router.refresh()
      }
    } catch (error) {
      setError("Failed to remove moderator")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: "moderator" | "admin", username: string) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await updateModeratorRole(forum.id, userId, newRole)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully updated ${username}'s role to ${newRole}`)
        router.refresh()
      }
    } catch (error) {
      setError("Failed to update role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Add New Moderator */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Add New Moderator</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter username"
              value={newModeratorUsername}
              onChange={(e) => setNewModeratorUsername(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          <Select value={newModeratorRole} onValueChange={(value: "moderator" | "admin") => setNewModeratorRole(value)}>
            <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="moderator" className="text-white hover:bg-gray-800">
                Moderator
              </SelectItem>
              <SelectItem value="admin" className="text-white hover:bg-gray-800">
                Admin
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddModerator}
            disabled={!newModeratorUsername.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      {/* Current Moderators */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Current Moderators</h4>
        <div className="space-y-3">
          {moderators.map((moderator) => (
            <div
              key={moderator.id}
              className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 border border-gray-800"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={moderator.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{moderator.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-white">
                      {moderator.profiles?.display_name || moderator.profiles?.username}
                    </h5>
                    <Badge
                      variant="outline"
                      className={
                        moderator.role === "admin"
                          ? "border-red-500/50 text-red-400"
                          : "border-blue-500/50 text-blue-400"
                      }
                    >
                      {moderator.role}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm">@{moderator.profiles?.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select 
                  value={moderator.role} 
                  onValueChange={(value: "moderator" | "admin") => 
                    handleUpdateRole(moderator.user_id, value, moderator.profiles?.username)
                  }
                  disabled={isLoading || moderator.user_id === forum.owner_id}
                >
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="moderator" className="text-white hover:bg-gray-800">
                      Moderator
                    </SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-800">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
                {moderator.user_id !== forum.owner_id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={() => handleRemoveModerator(moderator.user_id, moderator.profiles?.username)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {moderators.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No moderators added yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
