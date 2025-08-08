"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle } from 'lucide-react'
import { createForum } from "@/app/actions/forum"
import { FORUM_CATEGORIES } from "@/lib/constants"

export function CreateForumForm() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateForum = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createForum(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result?.redirectTo) {
        setShowCreateForm(false)
        router.push(result.redirectTo)
      }
    } catch (err) {
      console.error("Forum creation error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  if (!showCreateForm) {
    return (
      <Button
        onClick={() => setShowCreateForm(true)}
        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Forum
      </Button>
    )
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-purple-400">Create New Forum</CardTitle>
        <CardDescription className="text-gray-400">Set up your new community space</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleCreateForum} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-300">
                Forum Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter forum name"
                className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                required
                onChange={(e) => {
                  const subdomainInput = document.getElementById("subdomain") as HTMLInputElement
                  if (subdomainInput && !subdomainInput.value) {
                    subdomainInput.value = generateSubdomain(e.target.value)
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain" className="text-purple-300">
                Subdomain *
              </Label>
              <div className="flex">
                <div className="bg-gray-800 border border-r-0 border-purple-500/30 px-3 py-2 text-gray-400 rounded-l-md">
                  neoforum.app/
                </div>
                <Input
                  id="subdomain"
                  name="subdomain"
                  placeholder="yourforum"
                  className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 rounded-r-md rounded-l-none"
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-purple-300">
              Category *
            </Label>
            <Select name="category" required>
              <SelectTrigger className="bg-black/50 border-purple-500/30 text-white focus:border-purple-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/30">
                {FORUM_CATEGORIES.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-purple-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your forum community"
              className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Forum"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateForm(false)
                setError(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
