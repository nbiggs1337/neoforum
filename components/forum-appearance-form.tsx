"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadForumIcon, uploadForumBanner } from "@/app/actions/forum"

interface ForumAppearanceFormProps {
  forum: any
}

export function ForumAppearanceForm({ forum }: ForumAppearanceFormProps) {
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [iconMessage, setIconMessage] = useState("")
  const [bannerMessage, setBannerMessage] = useState("")

  async function handleIconUpload(formData: FormData) {
    setIsUploadingIcon(true)
    setIconMessage("")

    const result = await uploadForumIcon(forum.id, formData)

    if (result.error) {
      setIconMessage(result.error)
    } else {
      setIconMessage("Forum icon updated successfully!")
    }

    setIsUploadingIcon(false)
  }

  async function handleBannerUpload(formData: FormData) {
    setIsUploadingBanner(true)
    setBannerMessage("")

    const result = await uploadForumBanner(forum.id, formData)

    if (result.error) {
      setBannerMessage(result.error)
    } else {
      setBannerMessage("Forum banner updated successfully!")
    }

    setIsUploadingBanner(false)
  }

  return (
    <div className="space-y-6">
      {/* Forum Icon Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Forum Icon</h4>
            <p className="text-gray-400 text-sm">Upload a custom icon for your forum (max 2MB)</p>
          </div>
          {forum.icon_url && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
              <img src={forum.icon_url || "/placeholder.svg"} alt="Forum icon" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <form action={handleIconUpload} className="space-y-2">
          <Input
            type="file"
            name="icon"
            accept="image/*"
            className="bg-gray-900/50 border-gray-700 text-white file:bg-purple-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            required
          />
          <Button
            type="submit"
            disabled={isUploadingIcon}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
          >
            {isUploadingIcon ? "Uploading..." : "Upload Icon"}
          </Button>
        </form>
        
        {iconMessage && (
          <div className={`text-sm ${iconMessage.includes("error") ? "text-red-400" : "text-green-400"}`}>
            {iconMessage}
          </div>
        )}
      </div>

      {/* Forum Banner Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Banner Image</h4>
            <p className="text-gray-400 text-sm">Upload a banner image for your forum (max 5MB)</p>
          </div>
          {forum.banner_url && (
            <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-800">
              <img src={forum.banner_url || "/placeholder.svg"} alt="Forum banner" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <form action={handleBannerUpload} className="space-y-2">
          <Input
            type="file"
            name="banner"
            accept="image/*"
            className="bg-gray-900/50 border-gray-700 text-white file:bg-purple-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            required
          />
          <Button
            type="submit"
            disabled={isUploadingBanner}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
          >
            {isUploadingBanner ? "Uploading..." : "Upload Banner"}
          </Button>
        </form>
        
        {bannerMessage && (
          <div className={`text-sm ${bannerMessage.includes("error") ? "text-red-400" : "text-green-400"}`}>
            {bannerMessage}
          </div>
        )}
      </div>
    </div>
  )
}
