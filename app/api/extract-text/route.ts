import { NextRequest, NextResponse } from 'next/server'
import { createWorker } from 'tesseract.js'
import pdfParse from 'pdf-parse'
import { auth } from '@clerk/nextjs/server'
import { canUserMakeRequest, decrementUserUsage } from '@/lib/database'

// Helper function to create a timeout promise
const createTimeout = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== File Upload Request Received ===')
    
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ No user authentication')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user can make request (usage limits)
    const { canMake, usage } = await canUserMakeRequest(userId)
    
    if (!canMake) {
      console.log('❌ User has exceeded usage limits')
      return NextResponse.json({ 
        error: 'Usage limit exceeded. Please upgrade your plan to continue.',
        usageInfo: usage 
      }, { status: 403 })
    }
    
    console.log('✅ User authentication and usage check passed')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No file provided in request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('✅ File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Check file size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ error: 'File too large. Maximum size is 15MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('✅ File converted to buffer, size:', buffer.length, 'bytes')

    let extractedText = ''

    if (file.type === 'application/pdf') {
      // Handle PDF files
      console.log('🔍 Processing PDF file...')
      try {
        const data = await pdfParse(buffer)
        extractedText = data.text
        console.log('✅ PDF text extracted, length:', extractedText.length, 'characters')
      } catch (error) {
        console.error('❌ PDF parsing error:', error)
        return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 })
      }
    } else if (file.type.startsWith('image/')) {
      // Handle image files with OCR
      console.log('🔍 Processing image file with OCR...')
      console.log('📊 Image details - Type:', file.type, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      
      let worker = null
      try {
        // Create worker with default configuration
        console.log('🔧 Creating Tesseract worker with default config...')
        const startTime = Date.now()
        
        worker = await createWorker('eng')
        
        console.log('✅ Worker created in', Date.now() - startTime, 'ms')
        
        // Reduced timeout to 60 seconds for better UX
        const ocrTimeout = 60000 // 1 minute
        console.log('🔍 Starting OCR recognition with', ocrTimeout/1000, 'second timeout...')
        
        const ocrStartTime = Date.now()
        const ocrPromise = worker.recognize(buffer)
        
        const timeoutPromise = createTimeout(ocrTimeout)
        
        // Race between OCR and timeout
        console.log('⏳ OCR process started, waiting for result...')
        const result = await Promise.race([ocrPromise, timeoutPromise])
        
        const ocrDuration = Date.now() - ocrStartTime
        console.log('⏱️ OCR completed in', ocrDuration, 'ms')
        
        if (result && typeof result === 'object' && result !== null && 'data' in result) {
          const ocrResult = result as { data: { text: string } }
          extractedText = ocrResult.data.text
          console.log('✅ OCR text extracted, length:', extractedText.length, 'characters')
          console.log('📝 Preview:', extractedText.substring(0, 100) + '...')
        } else {
          console.log('❌ Invalid OCR result structure:', typeof result)
          throw new Error('OCR processing returned invalid result')
        }
        
      } catch (error) {
        console.error('❌ OCR processing error:', error)
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            console.log('⏰ OCR timed out after 60 seconds')
            return NextResponse.json({ 
              error: 'Image processing timed out after 60 seconds. Please try with a smaller or clearer image.' 
            }, { status: 408 })
          }
          if (error.message.includes('memory') || error.message.includes('Memory')) {
            console.log('💾 Memory error during OCR')
            return NextResponse.json({ 
              error: 'Image too large to process. Please try with a smaller image.' 
            }, { status: 413 })
          }
          if (error.message.includes('worker') || error.message.includes('Worker')) {
            console.log('🔧 Worker initialization error')
            return NextResponse.json({ 
              error: 'OCR service temporarily unavailable. Please try again in a moment.' 
            }, { status: 503 })
          }
        }
        
        console.log('🔍 General OCR error, might be image quality or format issue')
        return NextResponse.json({ 
          error: 'Failed to extract text from image. Please ensure the image contains clear, readable text.' 
        }, { status: 500 })
      } finally {
        // Always terminate the worker
        if (worker) {
          try {
            console.log('🔧 Terminating Tesseract worker...')
            await worker.terminate()
            console.log('✅ Tesseract worker terminated successfully')
          } catch (terminateError) {
            console.error('⚠️ Error terminating worker:', terminateError)
          }
        }
      }
    } else {
      console.log('❌ Unsupported file type:', file.type)
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    if (!extractedText.trim()) {
      console.log('❌ No text found in the document')
      return NextResponse.json({ 
        error: 'No text found in the document. Please ensure the image contains clear, readable text.' 
      }, { status: 400 })
    }

    // Decrement user usage on successful extraction
    await decrementUserUsage(userId)
    console.log('✅ User usage decremented')

    console.log('✅ Text extraction successful! Returning', extractedText.trim().length, 'characters')
    console.log('=== End of File Processing ===')
    return NextResponse.json({ text: extractedText.trim() })
  } catch (error) {
    console.error('❌ Text extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 