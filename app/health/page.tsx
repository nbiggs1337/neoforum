export default function HealthCheck() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-400 mb-4">✅ App is Running</h1>
        <p className="text-gray-300">Basic Next.js functionality is working</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}
