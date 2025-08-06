import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { SupportMessagesList } from "./support-messages-list"

async function getSupportStats() {
  const supabase = await createServerSupabaseClient()
  
  const { data: messages } = await supabase
    .from("support_messages")
    .select("status, priority")
  
  if (!messages) return { total: 0, open: 0, inProgress: 0, closed: 0, high: 0 }
  
  return {
    total: messages.length,
    open: messages.filter(m => m.status === 'open').length,
    inProgress: messages.filter(m => m.status === 'in_progress').length,
    closed: messages.filter(m => m.status === 'closed').length,
    high: messages.filter(m => m.priority === 'high').length,
  }
}

export default async function AdminSupportPage() {
  const stats = await getSupportStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Support Management
            </h1>
            <p className="text-gray-300">Manage and respond to user support requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6">
              <div className="text-2xl font-bold text-orange-400">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Messages</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-400">{stats.open}</div>
              <div className="text-sm text-gray-300">Open</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6">
              <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
              <div className="text-sm text-gray-300">In Progress</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-2xl font-bold text-green-400">{stats.closed}</div>
              <div className="text-sm text-gray-300">Closed</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
              <div className="text-2xl font-bold text-red-400">{stats.high}</div>
              <div className="text-sm text-gray-300">High Priority</div>
            </div>
          </div>

          {/* Support Messages */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg">
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading support messages...</p>
              </div>
            }>
              <SupportMessagesList filter="all" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
