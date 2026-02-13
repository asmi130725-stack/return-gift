import { NextRequest, NextResponse } from 'next/server'
import { suggestLayoutStyle } from '@/lib/openai'
import { Event } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, photoCount }: { event: Event; photoCount: number } = body

    if (!event || photoCount === undefined) {
      return NextResponse.json(
        { error: 'Event and photo count are required' },
        { status: 400 }
      )
    }

    // Suggest layout using OpenAI
    const layoutStyle = await suggestLayoutStyle(event, photoCount)

    return NextResponse.json({ layoutStyle })
  } catch (error) {
    console.error('Error suggesting layout:', error)
    return NextResponse.json(
      { error: 'Failed to suggest layout' },
      { status: 500 }
    )
  }
}
