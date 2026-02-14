'use client'

import { Photo } from '@/types'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PhotoCarousel from './PhotoCarousel'

export const SCRAPBOOK_TEMPLATES = [
  {
    id: 'template1',
    name: 'Pink Heart Frame',
    description: 'Hand-drawn border with hearts',
    icon: '💕',
    bestFor: 'Romantic moments',
  },
  {
    id: 'template2',
    name: 'Dried Flowers',
    description: 'Textured paper with botanical touch',
    icon: '🌿',
    bestFor: 'Natural & vintage',
  },
  {
    id: 'template3',
    name: 'Journal Page',
    description: 'Scrapbook with decorative frames',
    icon: '📖',
    bestFor: 'Artistic memories',
  },
  {
    id: 'template6',
    name: 'Floral Romance',
    description: 'Beautiful flower border',
    icon: '🌸',
    bestFor: 'Elegant love',
  },
] as const

interface ScrapbookLayoutProps {
  photos: Photo[]
  layoutStyle: 'template1' | 'template2' | 'template3' | 'template6'
  theme: string
  caption?: string
  eventTitle?: string
  eventDate?: string
  eventNotes?: string
  eventMood?: string
}

export default function ScrapbookLayout({
  photos,
  layoutStyle,
  theme,
  caption,
  eventTitle,
  eventDate,
  eventNotes,
  eventMood,
}: ScrapbookLayoutProps) {
  const renderLayout = () => {
    switch (layoutStyle) {
      case 'template1':
        return <Template1Layout photos={photos} />
      case 'template2':
        return <Template2Layout photos={photos} />
      case 'template3':
        return <Template3Layout photos={photos} />
      case 'template6':
        return <Template6Layout photos={photos} />
      default:
        return <Template1Layout photos={photos} />
    }
  }

  return (
    <div className="w-full">
      {/* Event Details Header */}
      {(eventTitle || eventDate || eventNotes || eventMood) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-lg p-2 border border-pink-200"
        >
          {eventTitle && (
            <h2 className="text-base font-handwriting font-bold text-gray-800 text-center mb-0.5">
              {eventTitle}
            </h2>
          )}
          {eventDate && (
            <p className="text-xs text-gray-600 text-center mb-0.5">
              📅 {new Date(eventDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
          {eventMood && (
            <p className="text-xs text-pink-600 font-medium text-center mb-0.5">
              {eventMood === 'joyful' && '😊'}
              {eventMood === 'romantic' && '💕'}
              {eventMood === 'nostalgic' && '🌅'}
              {eventMood === 'adventurous' && '🌍'}
              {eventMood === 'peaceful' && '🕊️'}
              {' '}{eventMood.charAt(0).toUpperCase() + eventMood.slice(1)}
            </p>
          )}
          {eventNotes && (
            <p className="text-xs text-gray-700 text-center italic">
              "{eventNotes}"
            </p>
          )}
        </motion.div>
      )}

      {/* AI Generated Love Quote */}
      {caption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <p className="text-xs font-serif italic text-center text-rose-700 px-2">
            💝 "{caption}"
          </p>
        </motion.div>
      )}
      
      {renderLayout()}
    </div>
  )
}

// Template 1: Pink Heart Frame - 1 photo when > 2, otherwise up to 3
function Template1Layout({ photos }: { photos: Photo[] }) {
  const displayPhotos = photos.length > 2 ? [photos[0]] : photos.slice(0, 3)
  
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      <Image
        src="/templates/template_1.jpg"
        alt="Template background"
        fill
        className="object-contain"
      />
      
      {photos.length > 2 ? (
        <div className="absolute inset-0 flex items-center justify-center p-[15%]">
          <PhotoCarousel photos={photos} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-[15%]">
          <div className={`grid gap-2 w-full h-full ${
            displayPhotos.length === 1 ? 'grid-cols-1' : 
            displayPhotos.length === 2 ? 'grid-cols-2' : 
            'grid-cols-2'
          }`}>
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative w-full h-full rounded-lg overflow-hidden shadow-lg"
              >
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Template 2: Dried Flowers - 1 photo when > 2, otherwise up to 4
function Template2Layout({ photos }: { photos: Photo[] }) {
  const displayPhotos = photos.length > 2 ? [photos[0]] : photos.slice(0, 4)
  
  return (
    <div className="relative w-full aspect-[3/4] max-w-2xl mx-auto">
      <Image
        src="/templates/template_2.jpg"
        alt="Template background"
        fill
        className="object-contain"
      />
      
      {photos.length > 2 ? (
        <div className="absolute top-[5%] left-[8%] right-[8%] bottom-[15%]">
          <PhotoCarousel photos={photos} />
        </div>
      ) : (
        <div className="absolute top-[5%] left-[8%] right-[8%] bottom-[15%]">
          <div className={`grid gap-4 w-full h-full ${
            displayPhotos.length === 1 ? 'grid-cols-1' : 
            displayPhotos.length === 2 ? 'grid-cols-2' : 
            displayPhotos.length === 3 ? 'grid-cols-3' : 
            'grid-cols-2 grid-rows-2'
          }`}>
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative w-full h-full rounded-lg overflow-hidden shadow-xl"
              >
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Template 3: Journal Page - 1 photo when > 2, otherwise up to 3
function Template3Layout({ photos }: { photos: Photo[] }) {
  const zones = [
    { top: '8%', left: '10%', width: '35%', height: '32%', rotate: -3 },
    { top: '35%', left: '50%', width: '38%', height: '35%', rotate: 2 },
    { top: '68%', left: '12%', width: '32%', height: '28%', rotate: -2 },
  ]
  
  const displayPhotos = photos.length > 2 ? [photos[0]] : photos.slice(0, 3)
  
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      <Image
        src="/templates/template_3.jpg"
        alt="Template background"
        fill
        className="object-contain"
      />
      
      <div className="absolute inset-0">
        {photos.length > 2 ? (
          <div className="absolute inset-0 flex items-center justify-center p-[10%]">
            <PhotoCarousel photos={photos} />
          </div>
        ) : (
          displayPhotos.map((photo, index) => {
            const zone = zones[index]
            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute overflow-hidden shadow-md rounded"
                style={{
                  top: zone.top,
                  left: zone.left,
                  width: zone.width,
                  height: zone.height,
                  transform: `rotate(${zone.rotate}deg)`,
                }}
              >
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Template 6: Floral Romance - 1 photo when > 2, otherwise up to 3
function Template6Layout({ photos }: { photos: Photo[] }) {
  const displayPhotos = photos.length > 2 ? [photos[0]] : photos.slice(0, 3)
  
  return (
    <div className="relative w-full aspect-[3/4] max-w-xl mx-auto">
      <Image
        src="/templates/template_6.jpg"
        alt="Template background"
        fill
        className="object-contain"
      />
      
      {photos.length > 2 ? (
        <div className="absolute inset-0 flex items-center justify-center px-[20%] py-[15%] pb-[25%]">
          <PhotoCarousel photos={photos} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-[20%] py-[15%] pb-[25%]">
          <div className={`grid gap-2 w-full h-full ${
            displayPhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative w-full h-full rounded-lg overflow-hidden shadow-lg"
              >
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
