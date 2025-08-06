'use client'

import { useState, useEffect } from "react"
import { getSupportMessages, updateSupportMessage } from "@/app/actions/support"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SupportMessage {
  id: number
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface SupportMessagesListProps {
  filter: string
}

export function SupportMessagesList({ filter }: SupportMessagesListProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const result = await getSupportMessages()
      if (result.success && result.data) {
        setMessages(result.data)
      } else {
        setError(result.error || 'Failed to load messages')
      }
    } catch (err) {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const result = await updateSupportMessage(id, { status })
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, status: status as any } : msg
        ))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleNotesUpdate = async (id: number, notes: string) => {
    try {
      const result = await updateSupportMessage(id, { admin_notes: notes })
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, admin_notes: notes } : msg
        ))
      }
    } catch (err) {
      console.error('Failed to update notes:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const filterMessages = (messages: SupportMessage[], filter: string) => {
    switch (filter) {
      case 'open': return messages.filter(m => m.status === 'open')
      case 'in_progress': return messages.filter(m => m.status === 'in_progress')
      case 'closed': return messages.filter(m => m.status === 'closed')
      case 'high': return messages.filter(m => m.priority === 'high')
      default: return messages
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading support messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Button onClick={loadMessages} className="mt-4 bg-purple-600 hover:bg-purple-700">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-700/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">All</TabsTrigger>
          <TabsTrigger value="open" className="data-[state=active]:bg-blue-600">Open</TabsTrigger>
          <TabsTrigger value="in_progress" className="data-[state=active]:bg-yellow-600">In Progress</TabsTrigger>
          <TabsTrigger value="closed" className="data-[state=active]:bg-green-600">Closed</TabsTrigger>
          <TabsTrigger value="high" className="data-[state=active]:bg-red-600">High Priority</TabsTrigger>
        </TabsList>

        {['all', 'open', 'in_progress', 'closed', 'high'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="mt-6">
            <div className="space-y-4">
              {filterMessages(messages, tabValue).map((message) => (
                <div key={message.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{message.subject}</h3>
                      <p className="text-sm text-gray-300">
                        From: {message.name} ({message.email}) • Category: {message.category}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <Select
                        value={message.status}
                        onValueChange={(value) => handleStatusUpdate(message.id, value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Admin Notes
                      </label>
                      <Textarea
                        value={message.admin_notes || ''}
                        onChange={(e) => handleNotesUpdate(message.id, e.target.value)}
                        placeholder="Add internal notes..."
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {filterMessages(messages, tabValue).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No messages found for this filter.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
