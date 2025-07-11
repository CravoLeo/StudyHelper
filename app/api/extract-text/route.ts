import { NextRequest, NextResponse } from 'next/server'
// import { createWorker, Worker } from 'tesseract.js' // Temporarily disabled
import pdfParse from 'pdf-parse'
import { auth } from '@clerk/nextjs/server'
import { canUserMakeRequest } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
// export const runtime = 'nodejs' // Not needed for PDF-only processing
// export const maxDuration = 30 // Not needed for PDF-only processing

// Helper function to create a timeout promise - not needed for PDF-only processing
// const createTimeout = (ms: number) => {
//   return new Promise((_, reject) => {
//     setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
//   })
// }

export async function POST(request: NextRequest) {
  try {
    console.log('=== File Upload Request Received ===')
    
    // Get form data first to check demo mode
    const formData = await request.formData()
    const file = formData.get('file') as File
    const demoMode = formData.get('demoMode') === 'true'
    
    // Check authentication - allow demo mode without login
    const { userId } = await auth()
    
    if (!demoMode && !userId) {
      console.log('❌ No user authentication (real mode requires login)')
      return NextResponse.json({ 
        error: 'Real AI features require an account. Try our demo mode to see how it works!',
        needsAuth: true 
      }, { status: 401 })
    }
    
    // Check if user can make request (usage limits) - skip in demo mode
    if (!demoMode && userId) {
      const { canMake, usage } = await canUserMakeRequest(userId)
      
      if (!canMake) {
        console.log('❌ User has exceeded usage limits')
        return NextResponse.json({ 
          error: 'Usage limit exceeded. Please upgrade your plan to continue.',
          usageInfo: usage 
        }, { status: 403 })
      }
      
      console.log('✅ User authentication and usage check passed')
    } else {
      console.log('🎭 Demo mode - skipping authentication and usage check')
    }

    if (!file) {
      console.log('❌ No file provided in request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('✅ File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      demoMode: demoMode
    })

    // Check file size limit (15MB for PDFs)
    if (file.size > 15 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 15MB.' 
      }, { status: 400 })
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
      // Image OCR temporarily disabled - suggest PDF conversion
      console.log('📋 Image upload detected - suggesting PDF conversion')
      return NextResponse.json({ 
        error: 'Image processing is currently unavailable. For best results, please convert your image to PDF using an online converter (like ilovepdf.com or smallpdf.com) and try again. PDF processing works perfectly with AI generation!' 
      }, { status: 400 })
    } else {
      console.log('❌ Unsupported file type:', file.type)
      return NextResponse.json({ 
        error: 'Unsupported file type. Currently only PDF files are supported. Please convert your document to PDF and try again.' 
      }, { status: 400 })
    }

    if (!extractedText.trim()) {
      console.log('❌ No text found in the document')
      return NextResponse.json({ 
        error: 'No text found in the PDF. Please ensure the PDF contains readable text (not just scanned images).' 
      }, { status: 400 })
    }

    // Note: Usage is NOT decremented here - text extraction is just preprocessing
    // Usage will be decremented in the AI generation API after successful completion
    if (!demoMode && userId) {
      console.log('✅ Text extraction successful - usage will be charged during AI generation')
    } else {
      console.log('🎭 Demo mode - no usage consumed')
    }

    console.log('✅ Text extraction successful! Returning', extractedText.trim().length, 'characters')
    console.log('=== End of File Processing ===')
    return NextResponse.json({ text: extractedText.trim() })
  } catch (error) {
    console.error('❌ Text extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 