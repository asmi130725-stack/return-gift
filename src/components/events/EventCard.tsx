'use client'

import { Event } from '@/types'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface EventCardProps {
  event: Event
  onClick?: () => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const [firstPhotoUrl, setFirstPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchFirstPhoto()
  }, [event.id])

  async function fetchFirstPhoto() {
    try {
      const response = await fetch(`/api/photos?eventId=${event.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.photos && data.photos.length > 0) {
          setFirstPhotoUrl(data.photos[0].url)
        }
      }
    } catch (error) {
      console.error('Error fetching first photo:', error)
    }
  }

  const moodColors = {
    romantic: 'from-pink-400 to-rose-400',
    playful: 'from-teal-400 to-cyan-400',
    nostalgic: 'from-amber-400 to-orange-400',
    adventurous: 'from-blue-400 to-indigo-400',
    joyful: 'from-green-400 to-emerald-400',
    peaceful: 'from-indigo-400 to-purple-400',
  }

  const gradientClass = event.mood ? moodColors[event.mood] : 'from-gray-400 to-gray-500'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
        {/* Cover Image or Gradient */}
        {firstPhotoUrl ? (
          <div className="relative h-56 w-full">
            <Image
              src={firstPhotoUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
            {/* Heart icon overlay */}
            <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className={`h-56 w-full bg-gradient-to-br ${gradientClass}`} />
        )}

        {/* Content - Positioned over image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
          {/* Date Badge */}
          <div className="inline-block px-2.5 py-0.5 mb-1.5 text-xs font-medium text-white bg-gray-900 bg-opacity-60 rounded-full">
            {formatDate(event.date)}
          </div>

          {/* Title */}
          <h3 className="text-lg font-handwriting font-bold text-white mb-1 line-clamp-1">
            {event.title}
          </h3>

          {/* Notes/Caption */}
          {(event.notes || event.aiCaption) && (
            <p className="text-sm text-white/80 line-clamp-1 mb-1">
              {event.notes || event.aiCaption}
            </p>
          )}

          {/* Mood Tag */}
          {event.mood && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-xs text-white capitalize">
                {event.mood}
              </span>
              <span className="text-xs">
                {event.mood === 'romantic' && '💕'}
                {event.mood === 'playful' && '🎉'}
                {event.mood === 'nostalgic' && '📸'}
                {event.mood === 'adventurous' && '🌍'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
