'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SwipeableGallery from '@/components/gallery/SwipeableGallery'
import ScrapbookLayout from '@/components/scrapbook/ScrapbookLayout'
import TemplateSelector from '@/components/scrapbook/TemplateSelector'
import AIGenerateButton from '@/components/ui/AIGenerateButton'
import BackgroundMusic from '@/components/scrapbook/BackgroundMusic'
import { Photo, LayoutStyle, Event, MoodType } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/compression'
import toast from 'react-hot-toast'
import SpotifySongSelector, { extractSpotifyTrackId } from '@/components/music/SpotifySongSelector'
import SoundtrackPlayer from '@/components/music/SoundtrackPlayer'
import { fetchWithCache, preloadImages, invalidateCache } from '@/lib/cache'

export default function ScrapbookPage() {
  const params = useParams()
  const router = useRouter()
  const [view, setView] = useState<'gallery' | 'scrapbook' | 'templates'>('scrapbook')
  const [layout, setLayout] = useState<LayoutStyle>('template1')
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [editPhotosList, setEditPhotosList] = useState<Photo[]>([])
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    notes: '',
    mood: '' as MoodType | '',
    spotifyUrl: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchEventData(params.id as string)
    }
  }, [params.id])

  async function fetchEventData(eventId: string) {
    try {
      setLoading(true)
      
      // Fetch event details with client caching
      const eventData = await fetchWithCache<{ event: Event }>(`/api/events/${eventId}`)
      setEvent(eventData.event)
      
      // Initialize edit form with event data
      setEditForm({
        title: eventData.event.title,
        date: String(eventData.event.date).split('T')[0],
        notes: eventData.event.notes || '',
        mood: eventData.event.mood || '',
        spotifyUrl: eventData.event.spotifyUrl || '',
      })
      
      // Set layout from event if available
      if (eventData.event.layoutStyle) {
        setLayout(eventData.event.layoutStyle)
      }

      // Fetch photos with client caching
      const photosData = await fetchWithCache<{ photos: Photo[] }>(`/api/photos?eventId=${eventId}`)
      const loadedPhotos = photosData.photos || []
      setPhotos(loadedPhotos)

      // Preload images into browser cache immediately so scrapbook and carousel are instant
      if (loadedPhotos.length > 0) {
        preloadImages(loadedPhotos.map(p => p.url))
      }
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const LOVE_QUOTES = [
    "In your arms, I have found my home and my heart's deepest peace.",
    "Every moment with you is a beautiful memory in the making.",
    "Love is not just looking at each other, but looking in the same direction together.",
    "You are my today and all of my tomorrows.",
    "In a sea of people, my eyes will always search for you.",
    "Together is my favorite place to be.",
    "You are the poem I never knew how to write, and this life is the story I've always wanted to tell.",
    "When I'm with you, hours feel like seconds. When we're apart, days feel like years.",
    "I fell in love with you because of a million tiny things you never knew you were doing.",
    "You are my sun, my moon, and all of my stars.",
    "Love is composed of a single soul inhabiting two bodies.",
    "My heart is perfect because you are inside it.",
    "Every love story is beautiful, but ours is my favorite.",
    "You make my heart smile in ways I never knew were possible.",
    "In your smile, I see something more beautiful than the stars.",
    "I choose you. And I'll choose you over and over, without pause, without doubt, in a heartbeat.",
    "You are my greatest adventure and my safest place.",
    "Forever is a long time, but I wouldn't mind spending it by your side.",
    "You are the missing piece I never knew my heart needed.",
    "With you, I am home, no matter where we are.",
    "Your hand in mine, and suddenly the world feels right.",
    "Love grows more tremendously full, swift, poignant, as the years multiply.",
    "You are my favorite notification, my sweetest distraction, my best decision.",
    "In your eyes, I found the reflection of my soul and the promise of forever.",
    "Our love story is my favorite fairy tale come true."
  ]

  const handleRegenerateCaption = async () => {
    if (!event) return

    try {
      setGeneratingCaption(true)
      
      // Select a random quote from fallback quotes
      const randomQuote = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)]

      // Update event with new caption
      const updateResponse = await fetch('/api/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          ai_caption: randomQuote,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update event with quote')
      }

      // Update local state immediately
      setEvent({ ...event, aiCaption: randomQuote })
    } catch (error) {
      console.error('Error generating quote:', error)
      alert('Failed to generate quote. Please try again.')
    } finally {
      setGeneratingCaption(false)
    }
  }
  const handleDelete = async () => {
    if (!event) return
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete memory')
      }

      // Redirect to home page after successful deletion
      router.push('/')
    } catch (error) {
      console.error('Error deleting memory:', error)
      alert('Failed to delete memory. Please try again.')
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    setPhotosToDelete([])
    setEditPhotosList([...photos])
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPhotosToDelete([])
    setSelectedFiles([])
    setEditPhotosList([])
    setEditForm({
      title: event?.title || '',
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
      notes: event?.notes || '',
      mood: event?.mood || '',
      spotifyUrl: event?.spotifyUrl || '',
    })
  }

  const moveEditPhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= editPhotosList.length) return
    const reordered = [...editPhotosList]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setEditPhotosList(reordered)
  }

  const setCoverPhoto = (index: number) => {
    moveEditPhoto(index, 0)
  }

  const handleSaveEdit = async () => {
    if (!event) return

    try {
      setLoading(true)

      // 1. Delete selected photos from storage and database
      if (photosToDelete.length > 0) {
        const photosToRemove = photos.filter(p => photosToDelete.includes(p.id))
        const filePaths = photosToRemove.map(p => p.publicId).filter(Boolean)
        
        // Delete from storage safely
        if (filePaths.length > 0) {
          try {
            await supabase.storage.from('photos').remove(filePaths)
          } catch (storageError) {
            console.warn('Storage deletion non-fatal error:', storageError)
          }
        }

        // Delete from database
        await Promise.allSettled(
          photosToDelete.map(photoId =>
            fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
          )
        )
      }

      // 2. Update order of remaining photos in database
      const remainingOrderedPhotos = editPhotosList.filter(p => !photosToDelete.includes(p.id))
      const orderUpdatePromises = remainingOrderedPhotos.map((photo, newOrder) =>
        fetch(`/api/photos/${photo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder }),
        })
      )
      await Promise.allSettled(orderUpdatePromises)

      // 3. Update event details
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          title: editForm.title,
          date: editForm.date,
          notes: editForm.notes,
          mood: editForm.mood || null,
          spotifyUrl: editForm.spotifyUrl || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update memory')
      }

      const { event: updatedEvent } = await response.json()

      // 4. Upload new photos if any
      if (selectedFiles.length > 0) {
        const startOrder = remainingOrderedPhotos.length
        const uploadedPhotos = []
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const originalFile = selectedFiles[i]
          const fileToUpload = await compressImage(originalFile)
          const fileExt = fileToUpload.name.split('.').pop() || 'webp'
          const fileName = `${event.id}/${Date.now()}-${i}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, fileToUpload)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)

          uploadedPhotos.push({
            url: publicUrl,
            publicId: uploadData.path,
            order: startOrder + i,
          })
        }

        // Save photo metadata to database
        const photoPromises = uploadedPhotos.map((photo) =>
          fetch('/api/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId: event.id,
              url: photo.url,
              publicId: photo.publicId,
              order: photo.order,
            }),
          })
        )

        await Promise.all(photoPromises)
      }
      
      // Invalidate cache and refresh photos and event data
      invalidateCache(event.id)
      invalidateCache('/api/events')
      await fetchEventData(event.id)
      setEvent(updatedEvent || event)
      setIsEditing(false)
      setSelectedFiles([])
      setPhotosToDelete([])
      toast.success('Memory updated successfully! ✨')
    } catch (error) {
      console.error('Error updating memory:', error)
      toast.error('Failed to update memory. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = async (templateId: string) => {
    const newLayout = templateId as LayoutStyle
    setLayout(newLayout)
    setView('scrapbook')
    
    // Save layout preference to database
    if (event) {
      invalidateCache(event.id)
      try {
        await fetch('/api/events', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event.id,
            layout_style: newLayout,
          }),
        })
      } catch (error) {
        console.error('Error saving layout:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <Link
            href="/events"
            className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header - Unified Desktop & Mobile */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="relative flex items-center justify-between">
            {/* Left: Back Arrow + Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                title="Back to memories"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <Link href="/" className="flex items-center gap-1.5">
                <span className="text-xl">🔖</span>
                <span className="text-xl sm:text-2xl font-handwriting font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
                  Bookmarks
                </span>
              </Link>
            </div>

            {/* Desktop View Toggle (Centered in Header Row) */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-gray-100/90 p-1 rounded-full border border-gray-200 shadow-inner">
              <button
                onClick={() => setView('gallery')}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                  view === 'gallery' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setView('templates')}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                  view === 'templates' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setView('scrapbook')}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                  view === 'scrapbook' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Scrapbook
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleEdit}
                className="p-1.5 hover:bg-pink-50 rounded-full text-gray-600 hover:text-pink-600 transition-colors"
                title="Edit memory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 hover:bg-red-50 rounded-full text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                title="Delete memory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile View Toggle (Only visible on Mobile < md) */}
          <div className="md:hidden flex gap-2 mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setView('gallery')}
              className={`flex-1 px-3 py-1.5 rounded-full font-semibold text-xs transition-all ${
                view === 'gallery' ? 'bg-pink-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setView('templates')}
              className={`flex-1 px-3 py-1.5 rounded-full font-semibold text-xs transition-all ${
                view === 'templates' ? 'bg-pink-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setView('scrapbook')}
              className={`flex-1 px-3 py-1.5 rounded-full font-semibold text-xs transition-all ${
                view === 'scrapbook' ? 'bg-pink-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Scrapbook
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden px-3 py-3 md:px-6 md:py-4 max-w-6xl mx-auto w-full flex flex-col justify-center">
        {view === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto w-full"
          >
            {photos.length > 0 ? (
              <>
                <SwipeableGallery
                  images={photos.map(p => p.url)}
                  captions={photos.map(p => p.aiGeneratedCaption || '')}
                />

                {/* AI Actions */}
                <div className="mt-4 flex gap-2 justify-center">
                  <AIGenerateButton
                    onGenerate={handleRegenerateCaption}
                    label={generatingCaption ? "Generating..." : "Generate Quote"}
                    variant="secondary"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No photos yet</p>
              </div>
            )}
          </motion.div>
        )}

        {view === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-y-auto max-h-[calc(100vh-6rem)] w-full py-2"
          >
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Choose Your Layout
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Select a template that best fits your memory
              </p>
            </div>
            
            <TemplateSelector
              selectedTemplate={layout}
              onSelectTemplate={handleSelectTemplate}
            />
          </motion.div>
        )}

        {view === 'scrapbook' && (
          <motion.div
            key="scrapbook"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {photos.length > 0 ? (
              <>
                {/* Mobile View: Vertical Stack */}
                <div className="md:hidden space-y-2.5 pb-16">
                  <ScrapbookLayout
                    photos={photos}
                    layoutStyle={layout}
                    theme={(event.mood as any) || 'romantic'}
                    caption={event.aiCaption || ''}
                    eventTitle={event.title}
                    eventDate={new Date(event.date).toISOString()}
                    eventNotes={event.notes}
                    eventMood={event.mood}
                    spotifyUrl={event.spotifyUrl}
                  />

                  {/* Linked Spotify Soundtrack Player */}
                  {event.spotifyUrl && (
                    <SoundtrackPlayer data={event.spotifyUrl} />
                  )}

                  {/* Actions */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-1.5">
                    <button
                      onClick={() => setView('templates')}
                      className="flex-1 px-3 py-2 rounded-full font-medium text-xs bg-white border border-pink-600 text-pink-600 hover:bg-pink-50 transition-colors"
                    >
                      🎨 Change Template
                    </button>
                    <AIGenerateButton
                      onGenerate={handleRegenerateCaption}
                      label={generatingCaption ? "Generating..." : "Generate Quote"}
                      disabled={generatingCaption}
                      variant="secondary"
                    />
                  </div>
                </div>

                {/* Desktop View: Side-by-Side Landscape Studio (No Vertical Scroll) */}
                <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12 h-full max-h-[calc(100vh-5.5rem)] w-full">
                  {/* Left: Perfectly Fitted Scrapbook Frame */}
                  <div className="flex-1 h-full max-h-[calc(100vh-6.5rem)] flex items-center justify-center">
                    <ScrapbookLayout
                      photos={photos}
                      layoutStyle={layout}
                      theme={(event.mood as any) || 'romantic'}
                      caption={event.aiCaption || ''}
                      eventTitle={event.title}
                      eventDate={new Date(event.date).toISOString()}
                      eventNotes={event.notes}
                      eventMood={event.mood}
                      spotifyUrl={event.spotifyUrl}
                    />
                  </div>

                  {/* Right: Studio Sidebar (Details, Music, Actions) */}
                  <div className="w-80 lg:w-96 flex flex-col justify-center space-y-4 shrink-0">
                    {/* Memory Card */}
                    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 rounded-2xl p-5 border border-pink-200/80 shadow-md shadow-pink-500/5">
                      <h2 className="text-xl font-handwriting font-bold text-gray-900 mb-1 leading-tight">
                        {event.title}
                      </h2>
                      <p className="text-xs text-gray-500 mb-2">
                        📅 {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      {event.mood && (
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 bg-pink-100 text-pink-700 rounded-full mb-3">
                          {event.mood.charAt(0).toUpperCase() + event.mood.slice(1)} Memory
                        </span>
                      )}
                      {event.notes && (
                        <p className="text-xs text-gray-700 italic font-serif leading-relaxed bg-white/70 p-3 rounded-xl border border-pink-100">
                          "{event.notes}"
                        </p>
                      )}
                    </div>

                    {/* Spotify Soundtrack Player */}
                    {event.spotifyUrl && (
                      <SoundtrackPlayer data={event.spotifyUrl} />
                    )}

                    {/* AI Love Quote */}
                    {event.aiCaption && (
                      <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-xs">
                        <p className="text-xs font-serif italic text-rose-700 leading-relaxed">
                          💝 "{event.aiCaption}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setView('templates')}
                        className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-white border border-pink-500 text-pink-600 hover:bg-pink-50 shadow-xs transition-all active:scale-95 text-center"
                      >
                        🎨 Change Template
                      </button>
                      <AIGenerateButton
                        onGenerate={handleRegenerateCaption}
                        label={generatingCaption ? "Generating..." : "Generate Quote"}
                        disabled={generatingCaption}
                        variant="secondary"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>No photos to display</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden border border-pink-100"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-gray-900">
                  Edit Memory 💕
                </h2>
                <p className="text-[11px] text-gray-500">
                  Update title, photos, mood and soundtrack
                </p>
              </div>
              <button
                onClick={handleCancelEdit}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors border border-gray-200 shadow-xs"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 divide-y divide-gray-100">
              {/* Section 1: Story Details */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span>✨</span> Memory Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Birthday Dinner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Story / Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="What made this moment unforgettable?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mood
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['romantic', 'playful', 'nostalgic', 'adventurous'] as const).map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, mood })}
                        className={`
                          px-2.5 py-1.5 rounded-xl font-medium text-xs transition-all border
                          ${editForm.mood === mood
                            ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }
                        `}
                      >
                        {mood === 'romantic' && '💕 Romantic'}
                        {mood === 'playful' && '🎉 Playful'}
                        {mood === 'nostalgic' && '📸 Nostalgic'}
                        {mood === 'adventurous' && '🌍 Adventure'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Photos & Cover */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <span>📸</span> Photos ({editPhotosList.length})
                  </h3>
                  <span className="text-[11px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                    💡 #1 is Cover Photo
                  </span>
                </div>

                {editPhotosList.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {editPhotosList.map((photo, index) => {
                      const isMarkedForDeletion = photosToDelete.includes(photo.id)
                      const isCover = index === 0 && !isMarkedForDeletion
                      return (
                        <div
                          key={photo.id}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-xs ${
                            isMarkedForDeletion
                              ? 'border-red-300 bg-red-50'
                              : isCover
                              ? 'border-pink-500 ring-2 ring-pink-300'
                              : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={photo.url} 
                            alt="Memory" 
                            className={`w-full h-full object-cover transition-opacity ${
                              isMarkedForDeletion ? 'opacity-20 grayscale' : ''
                            }`} 
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-1 left-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                              👑 Cover
                            </div>
                          )}

                          {/* Delete Toggle Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPhotosToDelete(prev => 
                                isMarkedForDeletion 
                                  ? prev.filter(id => id !== photo.id)
                                  : [...prev, photo.id]
                              )
                            }}
                            className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm z-20 ${
                              isMarkedForDeletion 
                                ? 'bg-red-500 text-white ring-1 ring-white' 
                                : 'bg-black/50 hover:bg-red-500 text-white'
                            }`}
                            title={isMarkedForDeletion ? 'Undo delete' : 'Delete photo'}
                          >
                            {isMarkedForDeletion ? '✓' : '✕'}
                          </button>

                          {/* Bottom Control Bar */}
                          {!isMarkedForDeletion && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 flex items-center justify-between text-white text-[10px] z-10">
                              <span className="bg-white/20 px-1 rounded font-bold">
                                #{index + 1}
                              </span>

                              <div className="flex items-center gap-0.5">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => moveEditPhoto(index, index - 1)}
                                    className="w-4 h-4 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"
                                    title="Move Left"
                                  >
                                    ←
                                  </button>
                                )}
                                {index < editPhotosList.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => moveEditPhoto(index, index + 1)}
                                    className="w-4 h-4 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"
                                    title="Move Right"
                                  >
                                    →
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add New Photos Input */}
                <div className="pt-1">
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl cursor-pointer bg-pink-50/40 hover:bg-pink-50 transition-colors">
                    <span className="text-xs font-semibold text-pink-600 flex items-center gap-1.5">
                      <span>➕</span> Upload More Photos
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files))
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {selectedFiles.length > 0 && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1 text-center">
                      ✓ {selectedFiles.length} new photo{selectedFiles.length !== 1 ? 's' : ''} queued to upload
                    </p>
                  )}
                </div>
              </div>

              {/* Section 3: Soundtrack */}
              <div className="pt-4">
                <SpotifySongSelector
                  value={editForm.spotifyUrl}
                  onChange={(url) => setEditForm(prev => ({ ...prev, spotifyUrl: url }))}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-100 transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.title || !editForm.date}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs sm:text-sm rounded-xl disabled:opacity-50 hover:shadow-md transition-all active:scale-98"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
