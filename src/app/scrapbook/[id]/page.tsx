'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SwipeableGallery from '@/components/gallery/SwipeableGallery'
import ScrapbookLayout from '@/components/scrapbook/ScrapbookLayout'
import TemplateSelector from '@/components/scrapbook/TemplateSelector'
import AIGenerateButton from '@/components/ui/AIGenerateButton'
import { Photo, LayoutStyle, Event, MoodType } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    notes: '',
    mood: '' as MoodType | '',
  })

  useEffect(() => {
    if (params.id) {
      fetchEventData(params.id as string)
    }
  }, [params.id])

  async function fetchEventData(eventId: string) {
    try {
      setLoading(true)
      
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error('Event not found')
      }
      const eventData = await eventResponse.json()
      setEvent(eventData.event)
      
      // Initialize edit form with event data
      setEditForm({
        title: eventData.event.title,
        date: eventData.event.date.split('T')[0],
        notes: eventData.event.notes || '',
        mood: eventData.event.mood || '',
      })
      
      // Set layout from event if available
      if (eventData.event.layoutStyle) {
        setLayout(eventData.event.layoutStyle)
      }

      // Fetch photos
      const photosResponse = await fetch(`/api/photos?eventId=${eventId}`)
      if (!photosResponse.ok) {
        throw new Error('Failed to fetch photos')
      }
      const photosData = await photosResponse.json()
      setPhotos(photosData.photos || [])
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
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPhotosToDelete([])
    setSelectedFiles([])
    setEditForm({
      title: event?.title || '',
      date: event?.date || '',
      notes: event?.notes || '',
      mood: event?.mood || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!event) return

    try {
      // 1. Delete selected photos from storage and database
      if (photosToDelete.length > 0) {
        const photosToRemove = photos.filter(p => photosToDelete.includes(p.id))
        const filePaths = photosToRemove.map(p => p.publicId)
        
        // Delete from storage
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('photos')
            .remove(filePaths)

          if (storageError) {
            console.error('Storage deletion error:', storageError)
            throw new Error('Failed to delete photos from storage')
          }
        }

        // Delete from database
        const deletePromises = photosToDelete.map(photoId =>
          fetch(`/api/photos/${photoId}`, {
            method: 'DELETE',
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to delete photo ${photoId}`)
            return res.json()
          })
        )
        await Promise.all(deletePromises)
      }

      // 2. Update event details
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update memory')
      }

      const { event: updatedEvent } = await response.json()

      // 3. Upload new photos if any
      if (selectedFiles.length > 0) {
        // Calculate start order based on remaining photos after deletion
        const remainingPhotosCount = photos.length - photosToDelete.length
        const uploadedPhotos = []
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${event.id}/${Date.now()}-${i}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, file)

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
            order: remainingPhotosCount + i,
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
      
      // Refresh photos and event data
      await fetchEventData(event.id)
      setEvent(updatedEvent)
      setIsEditing(false)
      setSelectedFiles([])
      setPhotosToDelete([])
    } catch (error) {
      console.error('Error updating memory:', error)
      alert('Failed to update memory. Please try again.')
    }
  }

  const handleSelectTemplate = async (templateId: string) => {
    const newLayout = templateId as LayoutStyle
    setLayout(newLayout)
    setView('scrapbook')
    
    // Save layout preference to database
    if (event) {
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
      {/* Header - Ultra compact for iPhone */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => router.back()} className="p-1">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-2xl font-handwriting font-bold text-pink-600 text-center uppercase flex-1">
              Return Gift
            </h1>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEdit}
                className="p-1"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setView('gallery')}
              className={`
                flex-1 px-3 py-1.5 rounded-full font-medium text-sm
                transition-all
                ${view === 'gallery'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              Gallery
            </button>
            <button
              onClick={() => setView('templates')}
              className={`
                flex-1 px-3 py-1.5 rounded-full font-medium text-sm
                transition-all
                ${view === 'templates'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              Templates
            </button>
            <button
              onClick={() => setView('scrapbook')}
              className={`
                flex-1 px-3 py-1.5 rounded-full font-medium text-sm
                transition-all
                ${view === 'scrapbook'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              Scrapbook
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-3 py-3">
        {view === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {photos.length > 0 ? (
              <>
                <SwipeableGallery
                  images={photos.map(p => p.url)}
                  captions={photos.map(p => p.aiGeneratedCaption || '')}
                />

                {/* AI Actions */}
                <div className="mt-4 flex gap-2">
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
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Choose Your Layout
              </h2>
              <p className="text-gray-600 text-sm">
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
          >
            {photos.length > 0 ? (
              <>
                <ScrapbookLayout
                  photos={photos}
                  layoutStyle={layout}
                  theme={(event.mood as any) || 'romantic'}
                  caption={event.aiCaption || ''}
                  eventTitle={event.title}
                  eventDate={event.date}
                  eventNotes={event.notes}
                  eventMood={event.mood}
                />

                {/* Actions */}
                <div className="mt-2 flex flex-col sm:flex-row gap-1.5">
                  <button
                    onClick={() => setView('templates')}
                    className="flex-1 px-3 py-1.5 rounded-full font-medium text-xs bg-white border border-pink-600 text-pink-600 hover:bg-pink-50 transition-colors"
                  >
                    Change Template
                  </button>
                  <AIGenerateButton
                    onGenerate={handleRegenerateCaption}
                    label={generatingCaption ? "Generating..." : "Generate Quote"}
                    disabled={generatingCaption}
                    variant="secondary"
                  />
                </div>

                {/* Current Layout Info */}
                <div className="mt-2 text-center pb-2">
                  <p className="text-xs text-gray-500">
                    Current template: <span className="font-medium capitalize">{layout}</span>
                  </p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-handwriting font-bold text-gray-900 mb-4">
              Edit Memory
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Give your memory a title"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Add some notes about this memory"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['romantic', 'playful', 'nostalgic', 'adventurous'] as const).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setEditForm({ ...editForm, mood })}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${editForm.mood === mood
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {mood === 'romantic' && '💕 Romantic'}
                      {mood === 'playful' && '🎉 Playful'}
                      {mood === 'nostalgic' && '📸 Nostalgic'}
                      {mood === 'adventurous' && '🌍 Adventurous'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Photos */}
            {photos.length > 0 && (
              <div>
                <label className="block font-handwriting text-lg text-gray-700 mb-3">
                  Current Photos ❤️
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => {
                    const isMarkedForDeletion = photosToDelete.includes(photo.id)
                    return (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-200 shadow-sm">
                        <img 
                          src={photo.url} 
                          alt="Memory" 
                          className={`w-full h-full object-cover transition-opacity ${
                            isMarkedForDeletion ? 'opacity-30' : ''
                          }`} 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotosToDelete(prev => 
                              isMarkedForDeletion 
                                ? prev.filter(id => id !== photo.id)
                                : [...prev, photo.id]
                            )
                          }}
                          className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                            isMarkedForDeletion 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {isMarkedForDeletion ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  {photosToDelete.length > 0 && (
                    <span className="text-red-500 font-semibold ml-2">
                      ({photosToDelete.length} marked for deletion)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Add New Photos */}
            <div>
              <label className="block font-handwriting text-lg text-gray-700 mb-3">
                Add More Photos 📷
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files))
                    }
                  }}
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gradient-to-r file:from-pink-500 file:to-rose-500
                    file:text-white file:cursor-pointer
                    hover:file:from-pink-600 hover:file:to-rose-600
                    file:transition-all file:duration-200
                  "
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-sm text-pink-700 font-medium">
                      ✓ {selectedFiles.length} new photo{selectedFiles.length !== 1 ? 's' : ''} ready to upload
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.title || !editForm.date}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
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
