"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus } from "lucide-react"

interface ForumModeratorsFormProps {
  forum: any
  moderators: any[]
}

export function ForumModeratorsForm({ forum, moderators }: ForumModeratorsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newModeratorUsername, setNewModeratorUsername] = useState("")

  return (
    <div className="space-y-6">
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
            />
          </div>
          <Select defaultValue="moderator">
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
            disabled={!newModeratorUsername || isLoading}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
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
                  <AvatarImage src={moderator.users?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{moderator.users?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-white">
                      {moderator.users?.display_name || moderator.users?.username}
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
                  <p className="text-gray-500 text-sm">@{moderator.users?.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue={moderator.role}>
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
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
