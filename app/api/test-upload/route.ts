import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Test Upload Endpoint Hit ===')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No file provided in test request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    }

    console.log('✅ Test file received:', fileInfo)
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully!',
      fileInfo: fileInfo
    })
    
  } catch (error) {
    console.error('❌ Test upload error:', error)
    return NextResponse.json({ error: 'Test upload failed' }, { status: 500 })
  }
} 