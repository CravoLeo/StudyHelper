'use client'

import { useState } from 'react'

export default function StreamTestPage() {
  const [chunks, setChunks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setChunks([])
    setLoading(true)
    
    try {
      const response = await fetch('/api/stream-test')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value)
        let lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            setChunks(prev => [...prev, line.replace('data: ', '')])
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      setChunks(prev => [...prev, `Error: ${error}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Streaming Test Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Streaming API</h2>
          <button 
            onClick={handleStart} 
            disabled={loading} 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Streaming...' : 'Start Streaming Test'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Received Chunks:</h3>
          <div className="space-y-2">
            {chunks.length === 0 ? (
              <p className="text-gray-400">No chunks received yet. Click "Start Streaming Test" to begin.</p>
            ) : (
              chunks.map((chunk, i) => (
                <div key={i} className="bg-gray-700 p-3 rounded border-l-4 border-green-500">
                  <span className="text-green-400 font-mono">Chunk {i + 1}:</span> {chunk}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>This page tests streaming responses from your API routes.</p>
          <p>If streaming works here, it will work on Vercel too.</p>
        </div>
      </div>
    </div>
  )
} 