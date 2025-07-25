import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Check file size (limit to 4MB for OCR)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 4MB for OCR.' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    console.log('🔍 Starting OCR processing for image:', file.name)

    // Use Google Cloud Vision REST API with API key
    // For now, we'll use a simple approach - you'll need to get an API key
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    
    if (!apiKey) {
      console.error('❌ No Google Cloud API key found')
      return NextResponse.json({ 
        error: 'OCR service not configured. Please add GOOGLE_CLOUD_API_KEY to your environment variables.' 
      }, { status: 500 })
    }

    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION'
              }
            ]
          }
        ]
      })
    })

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json()
      console.error('❌ Google Cloud Vision API Error:', errorData)
      throw new Error(`Vision API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const visionData = await visionResponse.json()
    const textAnnotations = visionData.responses?.[0]?.textAnnotations
    const extractedText = textAnnotations?.[0]?.description || ''

    console.log('✅ OCR completed successfully')
    console.log('📝 Extracted text length:', extractedText.length)

    if (!extractedText.trim()) {
      return NextResponse.json({ 
        error: 'No text found in image. Please try a clearer image with visible text.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      text: extractedText,
      confidence: 0.9, // Default confidence for REST API
      fileType: 'image',
      fileName: file.name
    })

  } catch (error) {
    console.error('❌ OCR Error:', error)
    
    return NextResponse.json({ 
      error: 'OCR processing failed. Please try again.' 
    }, { status: 500 })
  }
} 