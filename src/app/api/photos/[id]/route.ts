import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// DELETE a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (error) {
      console.error('Database deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}

// PATCH update a photo (e.g. order)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id
    const body = await request.json()

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (typeof body.order === 'number') {
      updateData.order = body.order
    }

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', photoId)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ photo: data })
  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}
