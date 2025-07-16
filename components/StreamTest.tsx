import { useState } from 'react';

export default function StreamTest() {
  const [chunks, setChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setChunks([]);
    setLoading(true);
    const response = await fetch('/api/stream-test');
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value);
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          setChunks(prev => [...prev, line.replace('data: ', '')]);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-gray-900 text-white max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Streaming Test</h2>
      <button onClick={handleStart} disabled={loading} className="px-4 py-2 bg-green-600 rounded mb-4">
        {loading ? 'Streaming...' : 'Start Streaming'}
      </button>
      <div className="space-y-2">
        {chunks.map((chunk, i) => (
          <div key={i} className="bg-gray-800 p-2 rounded">{chunk}</div>
        ))}
      </div>
    </div>
  );
} 