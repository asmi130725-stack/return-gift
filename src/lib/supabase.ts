import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database queries

export async function getEvents(userId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  
  // Map database snake_case to camelCase
  return data.map(event => ({
    ...event,
    userId: event.user_id,
    layoutStyle: event.layout_style,
    colorTheme: event.color_theme,
    aiCaption: event.ai_caption,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }))
}

export async function getEvent(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*, photos(*)')
    .eq('id', eventId)
    .single()

  if (error) throw error
  
  // Map database snake_case to camelCase
  return {
    ...data,
    userId: data.user_id,
    layoutStyle: data.layout_style,
    colorTheme: data.color_theme,
    aiCaption: data.ai_caption,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function createEvent(event: {
  userId: string
  title: string
  date: Date
  notes?: string
  mood?: string
}) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: event.userId,
      title: event.title,
      date: event.date.toISOString(),
      notes: event.notes,
      mood: event.mood,
    })
    .select()
    .single()

  if (error) throw error
  
  // Map database snake_case to camelCase
  return {
    ...data,
    userId: data.user_id,
    layoutStyle: data.layout_style,
    colorTheme: data.color_theme,
    aiCaption: data.ai_caption,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateEvent(eventId: string, updates: any) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  
  // Map database snake_case to camelCase
  return {
    ...data,
    userId: data.user_id,
    layoutStyle: data.layout_style,
    colorTheme: data.color_theme,
    aiCaption: data.ai_caption,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) throw error
}

export async function createPhoto(photo: {
  eventId: string
  url: string
  publicId: string
  order: number
  mediaType?: 'image' | 'video'
}) {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      event_id: photo.eventId,
      url: photo.url,
      public_id: photo.publicId,
      order: photo.order,
      media_type: photo.mediaType || 'image',
    })
    .select()
    .single()

  if (error) throw error
  return {
    ...data,
    mediaType: data.media_type,
  }
}

export async function getPhotos(eventId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('order', { ascending: true })

  if (error) throw error
  
  // Map database snake_case to camelCase
  return data?.map(photo => ({
    id: photo.id,
    eventId: photo.event_id,
    url: photo.url,
    publicId: photo.public_id,
    order: photo.order,
    mediaType: photo.media_type || 'image',
    positionX: photo.position_x,
    positionY: photo.position_y,
    width: photo.width,
    height: photo.height,
    scale: photo.scale,
    rotation: photo.rotation,
    cropData: photo.crop_data,
    aiGeneratedCaption: photo.ai_generated_caption,
    uploadedAt: photo.uploaded_at,
  })) || []
}

export async function updatePhoto(photoId: string, updates: any) {
  const { data, error } = await supabase
    .from('photos')
    .update(updates)
    .eq('id', photoId)
    .select()
    .single()

  if (error) throw error
  return data
}
