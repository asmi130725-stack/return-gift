import { NextRequest, NextResponse } from 'next/server'
import { generateEventCaption } from '@/lib/openai'
import { Event, Photo } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, photos }: { event: Event; photos: Photo[] } = body

    if (!event || !photos) {
      return NextResponse.json(
        { error: 'Event and photos are required' },
        { status: 400 }
      )
    }

    // Generate caption using OpenAI
    const caption = await generateEventCaption(event, photos)

    return NextResponse.json({ caption })
  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}
