'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PhotoUpload from '@/components/upload/PhotoUpload'
import AIGenerateButton from '@/components/ui/AIGenerateButton'
import { MoodType } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// For demo purposes, using a hardcoded user ID
// In production, you'd get this from authentication
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    mood: '' as MoodType | '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (formData.title && formData.date) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return

    try {
      setIsSubmitting(true)

      // 1. Create event in database first
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': DEMO_USER_ID,
        },
        body: JSON.stringify({
          title: formData.title,
          date: formData.date,
          notes: formData.notes,
          mood: formData.mood || 'romantic', // Default to romantic if not selected
        }),
      })

      if (!eventResponse.ok) {
        throw new Error('Failed to create event')
      }

      const { event } = await eventResponse.json()

      // 2. Upload photos to Supabase Storage
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

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        uploadedPhotos.push({
          url: publicUrl,
          publicId: uploadData.path,
          order: i,
        })
      }

      // 3. Save photo metadata to database
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

      // 4. Show success message
      toast.success(`Memory "${event.title}" created successfully! 🎉`)

      // 5. Navigate to the new scrapbook
      setTimeout(() => {
        router.push(`/scrapbook/${event.id}`)
      }, 500)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create memory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAITitleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    const titles = [
      'Sunset Dreams Together',
      'Coffee & Conversations',
      'Adventures with You',
      'A Perfect Day',
      'Making Memories',
    ]
    setFormData(prev => ({
      ...prev,
      title: titles[Math.floor(Math.random() * titles.length)],
    }))
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 sm:py-5 flex items-center gap-4">
          <Link href="/" className="touch-target">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-handwriting text-gray-900">
            Create New Memory
          </h1>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm sm:text-base font-medium hidden sm:inline">Details</span>
          </div>
          <div className="w-12 sm:w-20 h-1 bg-gray-200 relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-pink-600"
              initial={{ width: '0%' }}
              animate={{ width: step >= 2 ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm sm:text-base font-medium hidden sm:inline">Photos</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 max-w-2xl">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give this memory a title..."
                  className="
                    flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl
                    focus:border-pink-400 focus:outline-none
                    text-base sm:text-lg
                  "
                  disabled={isGenerating}
                />
                <button
                  onClick={handleAITitleGenerate}
                  disabled={isGenerating}
                  className="
                    px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500
                    text-white rounded-xl hover:shadow-lg transition-all
                    disabled:opacity-50
                    touch-target
                  "
                  title="Generate title with AI"
                >
                  <svg className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="
                  w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                  focus:border-pink-400 focus:outline-none
                  text-base sm:text-lg
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['romantic', 'playful', 'nostalgic', 'adventurous'] as MoodType[]).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setFormData(prev => ({ ...prev, mood }))}
                    className={`
                      px-4 py-3 rounded-xl border-2 transition-all
                      ${formData.mood === mood
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">
                      {mood === 'romantic' && '💕'}
                      {mood === 'playful' && '🎉'}
                      {mood === 'nostalgic' && '📸'}
                      {mood === 'adventurous' && '🌍'}
                    </div>
                    <div className="text-xs sm:text-sm capitalize">{mood}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this memory..."
                rows={4}
                className="
                  w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                  focus:border-pink-400 focus:outline-none resize-none
                  text-base
                "
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.title || !formData.date}
              className="
                w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500
                text-white font-semibold text-lg rounded-full
                shadow-lg hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-105 transition-all duration-200
                touch-target
              "
            >
              Next: Add Photos
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-handwriting text-gray-900 mb-2">
                Upload Your Photos
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Add photos to create a beautiful scrapbook page
              </p>
            </div>

            <PhotoUpload
              onPhotosSelected={(files) => setSelectedFiles(prev => [...prev, ...files])}
              maxFiles={20}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="
                  px-6 py-3 bg-white text-gray-700 font-medium rounded-full
                  border-2 border-gray-300 hover:border-pink-400
                  transition-all touch-target
                "
              >
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={selectedFiles.length === 0 || isSubmitting}
                className="
                  flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500
                  text-white font-semibold rounded-full
                  shadow-lg hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-105 transition-all duration-200
                  touch-target flex items-center justify-center gap-2
                "
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  `Create Memory (${selectedFiles.length} photo${selectedFiles.length !== 1 ? 's' : ''})`
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
