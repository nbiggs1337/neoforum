"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleForumPrivacy } from "@/app/actions/forum"

interface ForumPrivacyFormProps {
  forum: any
  canEdit: boolean
}

export function ForumPrivacyForm({ forum, canEdit }: ForumPrivacyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isPrivate, setIsPrivate] = useState(forum.is_private)

  async function handleTogglePrivacy() {
    setIsLoading(true)
    setMessage("")

    const result = await toggleForumPrivacy(forum.id)

    if (result.error) {
      setMessage(result.error)
    } else {
      setIsPrivate(result.isPrivate)
      setMessage(`Forum is now ${result.isPrivate ? "private" : "public"}`)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Forum Visibility</h4>
          <p className="text-gray-400 text-sm">
            {isPrivate ? "Private - Only members can view" : "Public - Anyone can view"}
          </p>
        </div>
        {canEdit ? (
          <Button
            onClick={handleTogglePrivacy}
            disabled={isLoading}
            variant="outline"
            className="border-gray-600 text-gray-300 bg-transparent hover:bg-purple-500/20"
          >
            {isLoading ? "Updating..." : (isPrivate ? "Make Public" : "Make Private")}
          </Button>
        ) : (
          <Button variant="outline" disabled className="border-gray-600 text-gray-500 bg-transparent">
            Admin Only
          </Button>
        )}
      </div>

      {message && (
        <div className={`text-sm ${message.includes("error") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Member Approval</h4>
          <p className="text-gray-400 text-sm">Require approval for new members</p>
        </div>
        {canEdit ? (
          <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent hover:bg-purple-500/20">
            Configure
          </Button>
        ) : (
          <Button variant="outline" disabled className="border-gray-600 text-gray-500 bg-transparent">
            Admin Only
          </Button>
        )}
      </div>
    </div>
  )
}
