'use client'

import { useState } from 'react'
import { updateSupportMessage, type SupportMessage } from '@/app/actions/support'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'

interface SupportMessagesListProps {
  messages: (SupportMessage & {
    user_profile?: { username: string; display_name: string } | null
    assigned_admin?: { username: string; display_name: string } | null
  })[]
}

export function SupportMessagesList({ messages }: SupportMessagesListProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')

  const filteredMessages = messages.filter(message => 
    filter === 'all' || message.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-blue-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handleStatusUpdate = async (messageId: string, status: string) => {
    setIsUpdating(true)
    try {
      const result = await updateSupportMessage(messageId, { status: status as any })
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNotesUpdate = async (messageId: string) => {
    setIsUpdating(true)
    try {
      const result = await updateSupportMessage(messageId, { admin_notes: adminNotes })
      if (result.success) {
        setAdminNotes('')
        setSelectedMessage(null)
        window.location.reload()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Failed to update notes')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({messages.filter(m => m.status === 'open').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({messages.filter(m => m.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({messages.filter(m => m.status === 'resolved').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({messages.filter(m => m.status === 'closed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No support messages found for this filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-white">{message.subject}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>From: {message.name} ({message.email})</span>
                          {message.user_profile && (
                            <span>• User: @{message.user_profile.username}</span>
                          )}
                          <span>• {formatDistanceToNow(new Date(message.created_at))} ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(message.status)} text-white`}>
                            {message.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getPriorityColor(message.priority)} text-white`}>
                            {message.priority}
                          </Badge>
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            {message.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={message.status}
                          onValueChange={(value) => handleStatusUpdate(message.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(selectedMessage === message.id ? null : message.id)
                            setAdminNotes(message.admin_notes || '')
                          }}
                        >
                          {selectedMessage === message.id ? 'Hide' : 'Manage'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Message:</Label>
                      <div className="mt-1 p-3 bg-gray-900 rounded-md border border-gray-700">
                        <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>

                    {message.admin_notes && (
                      <div>
                        <Label className="text-gray-300">Admin Notes:</Label>
                        <div className="mt-1 p-3 bg-blue-900/20 rounded-md border border-blue-700">
                          <p className="text-blue-300 whitespace-pre-wrap">{message.admin_notes}</p>
                        </div>
                      </div>
                    )}

                    {selectedMessage === message.id && (
                      <div className="space-y-3 pt-4 border-t border-gray-700">
                        <div>
                          <Label htmlFor="admin-notes" className="text-gray-300">
                            Admin Notes
                          </Label>
                          <Textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add internal notes about this support request..."
                            className="mt-1 bg-gray-900 border-gray-700 text-white"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleNotesUpdate(message.id)}
                            disabled={isUpdating}
                            size="sm"
                          >
                            {isUpdating ? 'Saving...' : 'Save Notes'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMessage(null)
                              setAdminNotes('')
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {message.resolved_at && (
                      <div className="text-sm text-green-400">
                        Resolved: {formatDistanceToNow(new Date(message.resolved_at))} ago
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
