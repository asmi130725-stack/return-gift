import { NextRequest, NextResponse } from 'next/server'
import { createPhoto, getPhotos } from '@/lib/supabase'

// GET photos for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const photos = await getPhotos(eventId)
    // Photos are already mapped to camelCase in getPhotos function
    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// POST create a new photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, url, publicId, order } = body

    if (!eventId || !url || !publicId) {
      return NextResponse.json(
        { error: 'Event ID, URL, and public ID are required' },
        { status: 400 }
      )
    }

    const photo = await createPhoto({
      eventId,
      url,
      publicId,
      order: order || 0,
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Error creating photo:', error)
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    )
  }
}
