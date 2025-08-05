"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateForumSettings } from "@/app/actions/forum"
import { FORUM_CATEGORIES } from "@/lib/constants"

interface ForumSettingsFormProps {
  forum: any
}

export function ForumSettingsForm({ forum }: ForumSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage("")

    const result = await updateForumSettings(forum.id, formData)

    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage("Forum settings updated successfully!")
    }

    setIsLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Forum Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={forum.name}
            className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">
            Category
          </Label>
          <Select name="category" defaultValue={forum.category}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {FORUM_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category} className="text-white hover:bg-gray-800">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Short Description
        </Label>
        <Input
          id="description"
          name="description"
          defaultValue={forum.description || ""}
          className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
          placeholder="Brief description of your forum"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="long_description" className="text-white">
          Detailed Description
        </Label>
        <Textarea
          id="long_description"
          name="long_description"
          defaultValue={forum.long_description || ""}
          className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 min-h-[120px]"
          placeholder="Detailed description of your forum, its purpose, and community guidelines"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules" className="text-white">
          Forum Rules
        </Label>
        <Textarea
          id="rules"
          name="rules"
          defaultValue={forum.rules || ""}
          className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 min-h-[120px]"
          placeholder="Community rules and guidelines"
        />
      </div>

      {message && (
        <div className={`text-sm ${message.includes("error") ? "text-red-400" : "text-green-400"}`}>{message}</div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
