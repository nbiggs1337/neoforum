"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile, uploadAvatar } from "@/app/actions/profile"
import { Camera, Upload, X, Check } from 'lucide-react'

interface ProfileFormProps {
  user: any
  profile: any
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [previewUrl, setPreviewUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage("")

    // Add the current avatar URL to the form data
    formData.set("avatar_url", avatarUrl)

    const result = await updateProfile(formData)

    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage("Profile updated successfully!")
    }

    setIsLoading(false)
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be less than 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setMessage("")
  }

  async function handleAvatarUpload() {
    if (!selectedFile) return

    setIsLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("avatar", selectedFile)

    const result = await uploadAvatar(formData)

    if (result.error) {
      setMessage(result.error)
    } else if (result.avatarUrl) {
      setAvatarUrl(result.avatarUrl)
      setPreviewUrl("")
      setSelectedFile(null)
      setMessage("Avatar updated successfully!")
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Force page refresh to show updated avatar
      window.location.reload()
    }

    setIsLoading(false)
  }

  function cancelUpload() {
    setPreviewUrl("")
    setSelectedFile(null)
    setMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-purple-500/30">
            <AvatarImage src={previewUrl || avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-black font-bold text-2xl">
              {profile?.username?.[0] || user.email?.[0]}
            </AvatarFallback>
          </Avatar>
          {!previewUrl && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-purple-500/50 bg-black/80 hover:bg-purple-500/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">Profile Picture</h4>
          <p className="text-gray-400 text-sm mb-2">Upload a new avatar image (max 5MB)</p>

          {!previewUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Image
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAvatarUpload}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelUpload}
                disabled={isLoading}
                className="border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {selectedFile && (
            <p className="text-gray-400 text-xs mt-1">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile?.username || ""}
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              required
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\s/g, '')
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-white">
              Display Name
            </Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name || ""}
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              placeholder="How others will see your name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
            disabled
          />
          <p className="text-gray-500 text-sm">Email cannot be changed here. Contact support if needed.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">
            Bio
          </Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio || ""}
            className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 min-h-[100px]"
            placeholder="Tell others about yourself..."
          />
        </div>

        {message && (
          <div
            className={`text-sm ${message.includes("error") || message.includes("Error") ? "text-red-400" : "text-green-400"}`}
          >
            {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
