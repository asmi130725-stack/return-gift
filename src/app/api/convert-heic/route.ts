import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert HEIC to JPEG using sharp
    const convertedBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer()

    // Return the converted image as a response
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    
    return new NextResponse(convertedBuffer.buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Server-side HEIC conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert HEIC image' },
      { status: 500 }
    )
  }
}
