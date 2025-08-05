"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertCircle } from "lucide-react"
import { createPost } from "@/app/actions/post"

interface CreatePostDialogProps {
  forumId: string
}

export function CreatePostDialog({ forumId }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    // Add forum ID to form data
    formData.append("forum_id", forumId)

    try {
      const result = await createPost(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setOpen(false)
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-400">Create New Thread</DialogTitle>
          <DialogDescription className="text-gray-400">Start a new discussion in this forum</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-purple-300">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter thread title"
              className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-purple-300">
              Content *
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write your post content..."
              className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
