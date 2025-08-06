export default function DebugPage() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? '✅ Set' : '❌ Missing',
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">🔍 Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-purple-500/30">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-300 font-mono text-sm">{key}:</span>
                  <span className={`text-sm ${value.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">System Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Timestamp:</span>
                <span className="text-white font-mono">{new Date().toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Node Version:</span>
                <span className="text-white font-mono">{process.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Platform:</span>
                <span className="text-white font-mono">{process.platform}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-yellow-500/30">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">⚠️ Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Check that all environment variables are set in your deployment platform</li>
            <li>Verify Supabase URL and keys are correct</li>
            <li>Ensure database is accessible and tables exist</li>
            <li>Check server logs for specific error messages</li>
            <li>Try accessing /health endpoint to test basic functionality</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
