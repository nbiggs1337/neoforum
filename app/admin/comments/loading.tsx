import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCommentsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated nightscape background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-lg bg-gray-800" />
            <Skeleton className="h-8 w-64 bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-96 bg-gray-800" />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded bg-gray-800" />
                  <div>
                    <Skeleton className="h-6 w-12 mb-2 bg-gray-800" />
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full bg-gray-800" />
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-gray-800" />
            <Skeleton className="h-4 w-32 bg-gray-800" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-gray-700 rounded-lg p-6 bg-gray-900/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full bg-gray-800" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2 bg-gray-800" />
                        <Skeleton className="h-3 w-48 bg-gray-800" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16 bg-gray-800" />
                      <Skeleton className="h-6 w-16 bg-gray-800" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full mb-4 bg-gray-800" />
                  <Skeleton className="h-12 w-full mb-4 bg-gray-800" />
                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                    <Skeleton className="h-8 w-20 bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
