"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Type, X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { createClientSupabaseClient } from "@/lib/supabase"
import Image from "next/image"

interface CreatePostFormProps {
  subdomain: string
  createPostAction: (formData: FormData) => Promise<{ success?: boolean; error?: string; redirectTo?: string; postId?: string }>
}

export function CreatePostForm({ subdomain, createPostAction }: CreatePostFormProps) {
  const router = useRouter()
  const [postType, setPostType] = useState<"text" | "photo">("text")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setUploadError("Some files were skipped. Only images under 10MB are allowed.")
    } else {
      setUploadError(null)
    }

    // Limit to 5 images total
    const newFiles = [...selectedImages, ...validFiles].slice(0, 5)
    setSelectedImages(newFiles)

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    
    setSelectedImages(newFiles)
    setImagePreviews(newPreviews)
  }

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return []

    setIsUploading(true)
    setUploadError(null)

    try {
      const supabase = createClientSupabaseClient()
      const uploadedUrls: string[] = []

      for (const file of selectedImages) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { data, error } = await supabase.storage
          .from('forum-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          
          // Handle specific error cases
          if (error.message.includes('Bucket not found')) {
            throw new Error('Image storage is not configured. Please contact support.')
          } else if (error.message.includes('row-level security')) {
            throw new Error('You need to be logged in to upload images.')
          } else if (error.message.includes('File size')) {
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`)
          } else {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`)
          }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('forum-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Image upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("subdomain", subdomain)
      formData.append("postType", postType)

      // Upload images if it's a photo post
      if (postType === "photo" && selectedImages.length > 0) {
        const imageUrls = await uploadImages()
        formData.append("imageUrls", JSON.stringify(imageUrls))
      }

      const result = await createPostAction(formData)

      if (result.error) {
        setUploadError(result.error)
      } else if (result.success && result.redirectTo) {
        setSuccessMessage("Post created successfully! Redirecting...")
        // Use router.push for client-side navigation
        setTimeout(() => {
          router.push(result.redirectTo!)
        }, 1000)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Type Selection */}
      <Tabs value={postType} onValueChange={(value) => setPostType(value as "text" | "photo")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-purple-500/30">
          <TabsTrigger 
            value="text" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Type className="w-4 h-4" />
            Text Post
          </TabsTrigger>
          <TabsTrigger 
            value="photo" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <ImageIcon className="w-4 h-4" />
            Photo Post
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter your post title..."
              required
              className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-300">
              Content
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="What's on your mind?"
              required
              rows={12}
              className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 resize-none"
            />
          </div>
        </TabsContent>

        <TabsContent value="photo" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="photo-title" className="text-gray-300">
              Title
            </Label>
            <Input
              id="photo-title"
              name="title"
              placeholder="Enter your post title..."
              required
              className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            <Label className="text-gray-300">Images (up to 5)</Label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 5}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedImages.length === 0 ? "Select Images" : "Add More"}
              </Button>
              <span className="text-sm text-gray-400">
                {selectedImages.length}/5 images selected
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <Card key={index} className="relative bg-gray-800/50 border-gray-600 overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative aspect-square">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-content" className="text-gray-300">
              Caption (optional)
            </Label>
            <Textarea
              id="photo-content"
              name="content"
              placeholder="Add a caption to your photos..."
              rows={4}
              className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 resize-none"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading || (postType === "photo" && selectedImages.length === 0)}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
        >
          {isSubmitting ? "Creating..." : isUploading ? "Uploading..." : "Create Post"}
        </Button>
      </div>
    </form>
  )
}
