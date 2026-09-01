import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist yet or other query error
      return NextResponse.json({ messages: [], fallback: true })
    }

    return NextResponse.json({
      messages: (data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        content: m.content,
        color: m.color || 'from-rose-500 to-pink-600',
        createdAt: m.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ messages: [], fallback: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, color } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: DEFAULT_USER_ID,
        title,
        content,
        color: color || 'from-rose-500 to-pink-600',
      })
      .select()
      .single()

    if (error) {
      console.warn('Supabase insert message error (will fallback locally):', error.message)
      // Return synthetic success so client continues seamlessly
      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          title,
          content,
          color: color || 'from-rose-500 to-pink-600',
          createdAt: new Date().toISOString(),
        },
        fallback: true,
      })
    }

    return NextResponse.json({
      message: {
        id: data.id,
        title: data.title,
        content: data.content,
        color: data.color,
        createdAt: data.created_at,
      },
    })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Supabase delete message error:', error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
