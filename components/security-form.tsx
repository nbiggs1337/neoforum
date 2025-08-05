"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { updatePassword } from "@/app/actions/profile"
import { Shield, Key, Smartphone } from "lucide-react"

interface SecurityFormProps {
  user: any
}

export function SecurityForm({ user }: SecurityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handlePasswordUpdate(formData: FormData) {
    setIsLoading(true)
    setMessage("")

    const result = await updatePassword(formData)

    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage("Password updated successfully!")
      // Reset form
      const form = document.getElementById("password-form") as HTMLFormElement
      form?.reset()
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-medium">Change Password</h4>
        </div>
        <form id="password-form" action={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-white">
              Current Password
            </Label>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-white">
              New Password
            </Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-white">
              Confirm New Password
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500"
              required
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
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      <Separator className="bg-gray-700" />

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-medium">Two-Factor Authentication</h4>
        </div>
        <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div>
            <h5 className="text-white font-medium">Authenticator App</h5>
            <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
          </div>
          <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
            Enable 2FA
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-medium">Account Information</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Account Created</span>
            <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Last Sign In</span>
            <span className="text-white">{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Email Verified</span>
            <span className={user.email_confirmed_at ? "text-green-400" : "text-red-400"}>
              {user.email_confirmed_at ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
