'use client'

import { useState } from 'react'
import { createWorker } from 'tesseract.js'
import { Loader2, AlertCircle } from 'lucide-react'

interface ClientOCRProps {
  file: File
  onTextExtracted: (text: string) => void
  onError: (error: string) => void
}

export default function ClientOCR({ file, onTextExtracted, onError }: ClientOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  const handleClientOCR = async () => {
    setIsProcessing(true)
    setProgress(0)
    setStatus('Initializing OCR...')

    let worker = null
    try {
      // Create worker in browser environment
      worker = await createWorker('eng', 1, {
        logger: m => {
          setStatus(m.status)
          setProgress(Math.round(m.progress * 100))
          console.log(`Client OCR: ${m.status} - ${Math.round(m.progress * 100)}%`)
        }
      })

      console.log('🔧 Client-side OCR worker created')
      
      // Convert file to data URL for browser processing
      const imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      setStatus('Processing image...')
      
      // Process with OCR
      const result = await worker.recognize(imageData)
      
      if (result.data.text) {
        console.log('✅ Client OCR successful:', result.data.text.length, 'characters')
        console.log('📊 OCR confidence:', result.data.confidence)
        onTextExtracted(result.data.text.trim())
      } else {
        throw new Error('No text found in image')
      }

    } catch (error) {
      console.error('❌ Client OCR error:', error)
      onError(error instanceof Error ? error.message : 'OCR processing failed')
    } finally {
      if (worker) {
        await worker.terminate()
      }
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Server OCR Failed
        </h3>
        <p className="text-gray-400 mb-6">
          Server-side OCR is having issues. Try client-side processing instead.
        </p>
        
        {!isProcessing ? (
          <button
            onClick={handleClientOCR}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Client-Side OCR
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-white font-medium">Processing in Browser...</span>
            </div>
            
            <div className="text-sm text-gray-400">{status}</div>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-400">{progress}% complete</div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          Client-side processing may be slower but more reliable for complex images.
        </div>
      </div>
    </div>
  )
} 