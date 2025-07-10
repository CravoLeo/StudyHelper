'use client'

import { useEffect, useState } from 'react'
import { Loader2, FileText, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

interface TextExtractionProps {
  file: File
  onTextExtracted: (text: string) => void
  demoMode?: boolean
}

export default function TextExtraction({ file, onTextExtracted, demoMode = false }: TextExtractionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')
  const [showFullText, setShowFullText] = useState(false)

  useEffect(() => {
    const extractText = async () => {
      setIsLoading(true)
      setError('')

      try {
        console.log('📤 Sending file to API:', {
          name: file.name,
          type: file.type,
          size: file.size
        })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('demoMode', demoMode.toString())

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData
        })

        console.log('📥 API Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ API Error:', errorData)
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Extraction successful:', {
          textLength: data.text?.length || 0,
          preview: data.text?.substring(0, 100) + '...'
        })

        setExtractedText(data.text || '')
        onTextExtracted(data.text || '')
        
        if (!demoMode) {
          // Refresh usage after successful extraction (only in real mode)
          const refreshEvent = new CustomEvent('refreshUsage')
          window.dispatchEvent(refreshEvent)
          console.log('🔄 Usage refresh event dispatched after text extraction')
        } else {
          console.log('🎭 Demo mode - no usage consumed for text extraction')
        }
      } catch (err) {
        console.error('❌ Text extraction failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to extract text')
      } finally {
        setIsLoading(false)
      }
    }

    extractText()
  }, [file, onTextExtracted])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={24} className="text-green-400 animate-pulse" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              Extracting text from your document
            </h3>
            <p className="text-gray-400 text-lg">
              {file.type === 'application/pdf' ? 'Reading PDF content...' : 'Running OCR analysis...'}
            </p>
            {file.type.startsWith('image/') && (
              <p className="text-gray-500 text-sm mt-2">
                Image OCR processing may take up to 60 seconds
              </p>
            )}
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {file.type === 'application/pdf' 
                    ? 'Reading PDF structure' 
                    : 'Running OCR on image'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>
                  {file.type === 'application/pdf' 
                    ? 'Extracting text content' 
                    : 'Recognizing text characters'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Preparing for AI analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if this is a usage limit error
    const isUsageLimitError = error.includes('Usage limit exceeded')
    
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-500/30">
            <XCircle size={32} className="text-red-400" />
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {isUsageLimitError ? 'Usage limit reached' : 'Extraction failed'}
            </h3>
            <p className="text-gray-400 text-lg max-w-md">
              {error}
            </p>
          </div>
          
          {isUsageLimitError ? (
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-yellow-300 text-sm">
                  🚀 Upgrade your plan to continue processing documents with AI-powered summaries and study questions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      // Trigger the pricing modal - we'll need to pass this up to the parent
                      const event = new CustomEvent('openPricingModal')
                      window.dispatchEvent(event)
                    }}
                    className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                  >
                    View Pricing Plans
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-red-300 text-sm">
                Please try uploading a different file or check if your file is corrupted.
              </p>
            </div>
          )}
          
          {!isUsageLimitError && (
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-500/30">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              Text extracted successfully
            </h3>
            <p className="text-gray-400">
              {extractedText.length.toLocaleString()} characters extracted from {file.name}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-green-400 rounded-xl hover:bg-gray-700/80 transition-colors duration-200 border border-gray-600"
        >
          {showFullText ? <EyeOff size={18} /> : <Eye size={18} />}
          <span className="font-medium">
            {showFullText ? 'Hide' : 'Show'} full text
          </span>
        </button>
      </div>

      {showFullText && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Extracted Text</h4>
            <span className="text-sm text-gray-400">
              {extractedText.length.toLocaleString()} characters
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {extractedText}
            </pre>
          </div>
        </div>
      )}
      
      <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle size={16} className="text-white" />
          </div>
          <div>
            <p className="text-green-200 font-medium">Ready for AI processing</p>
            <p className="text-green-300/80 text-sm">
              The text has been successfully extracted and is ready for summary and question generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 