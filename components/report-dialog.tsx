"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag } from "lucide-react"
import { createReport } from "@/app/actions/report"

interface ReportDialogProps {
  postId?: string
  commentId?: string
  trigger?: React.ReactNode
  disabled?: boolean
}

export function ReportDialog({ postId, commentId, trigger, disabled = false }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const targetType = postId ? "Post" : "Comment"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      setMessage({ type: "error", text: "Please select a reason for reporting" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    if (postId) {
      formData.append("postId", postId)
    }
    if (commentId) {
      formData.append("commentId", commentId)
    }
    formData.append("reason", reason)
    formData.append("details", details)

    const result = await createReport(formData)

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Report submitted successfully" })
      setReason("")
      setDetails("")
      setTimeout(() => {
        setOpen(false)
        setMessage(null)
      }, 2000)
    } else {
      setMessage({ type: "error", text: result.error || "Failed to submit report" })
    }

    setIsSubmitting(false)
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
    >
      <Flag className="h-4 w-4 mr-1" />
      Report
    </Button>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          // Reset state when dialog closes
          setMessage(null)
          setReason("")
          setDetails("")
        }
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Report {targetType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-gray-300">
              Reason for reporting *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="copyright">Copyright Violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details" className="text-gray-300">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide additional context for your report..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              rows={3}
            />
          </div>

          {message && (
            <div
              className={`text-sm p-2 rounded ${
                message.type === "success"
                  ? "bg-green-900/50 text-green-400 border border-green-700"
                  : "bg-red-900/50 text-red-400 border border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason} className="bg-red-600 hover:bg-red-700 text-white">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
