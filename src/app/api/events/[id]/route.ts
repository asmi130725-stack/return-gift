import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEvent(params.id)
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    // First, get all photos for this event
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('public_id')
      .eq('event_id', eventId)

    if (photosError) throw photosError

    // Delete photos from storage bucket
    if (photos && photos.length > 0) {
      const filePaths = photos.map(photo => photo.public_id)
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove(filePaths)

      if (storageError) {
        console.error('Error deleting photos from storage:', storageError)
      }
    }

    // Delete photos from database (cascade should handle this, but explicit is better)
    const { error: deletePhotosError } = await supabase
      .from('photos')
      .delete()
      .eq('event_id', eventId)

    if (deletePhotosError) throw deletePhotosError

    // Delete the event
    const { error: deleteEventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteEventError) throw deleteEventError

    return NextResponse.json({ success: true, message: 'Memory deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    )
  }
}
