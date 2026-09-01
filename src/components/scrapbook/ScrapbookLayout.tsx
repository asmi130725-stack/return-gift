'use client'

import { useState, useRef, useEffect } from 'react'
import { Photo, LayoutStyle } from '@/types'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PhotoCarousel from './PhotoCarousel'
import { parseSoundtrackData, extractSpotifyTrackId } from '@/components/music/SpotifySongSelector'

export const SCRAPBOOK_TEMPLATES = [
  {
    id: 'template1',
    name: 'Template 1',
    imageSrc: '/templates/template_1.jpg',
  },
  {
    id: 'template2',
    name: 'Template 2',
    imageSrc: '/templates/template_2.jpg',
  },
  {
    id: 'template3',
    name: 'Template 3',
    imageSrc: '/templates/template_3.jpg',
  },
  {
    id: 'template4',
    name: 'Template 4',
    imageSrc: '/templates/template_4.jpeg',
  },
  {
    id: 'template5',
    name: 'Template 5',
    imageSrc: '/templates/template_5.jpeg',
  },
  {
    id: 'template6',
    name: 'Template 6',
    imageSrc: '/templates/template_6.jpg',
  },
  {
    id: 'template7',
    name: 'Template 7',
    imageSrc: '/templates/template_7.jpeg',
  },
  {
    id: 'template8',
    name: 'Template 8',
    imageSrc: '/templates/template_8.jpeg',
  },
  {
    id: 'template9',
    name: 'Template 9',
    imageSrc: '/templates/template_9.jpeg',
  },
  {
    id: 'template10',
    name: 'Template 10',
    imageSrc: '/templates/template_10.jpeg',
  },
] as const

interface ScrapbookLayoutProps {
  photos: Photo[]
  layoutStyle: LayoutStyle
  theme: string
  caption?: string
  eventTitle?: string
  eventDate?: string
  eventNotes?: string
  eventMood?: string
  spotifyUrl?: string
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
  spotifyUrl,
}: ScrapbookLayoutProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const soundtrack = spotifyUrl ? parseSoundtrackData(spotifyUrl) : null
  const playableAudioUrl = soundtrack?.previewUrl || (soundtrack?.url?.endsWith('.mp3') || soundtrack?.url?.includes('apple') ? soundtrack.url : null)
  const spotifyTrackId = soundtrack?.url ? extractSpotifyTrackId(soundtrack.url) : (spotifyUrl ? extractSpotifyTrackId(spotifyUrl) : null)

  const togglePlay = () => {
    if (!audioRef.current && playableAudioUrl) {
      const audio = new Audio(playableAudioUrl)
      audio.volume = 0.6
      audio.onended = () => setIsPlaying(false)
      audioRef.current = audio
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.warn(e))
      }
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [spotifyUrl])

  const renderLayout = () => {
    const commonProps = {
      photos,
      caption,
      eventDate,
      eventTitle,
      eventNotes,
      eventMood,
      spotifyUrl,
      showDots: false,
    }

    switch (layoutStyle) {
      case 'template1':
        return <Template1Layout {...commonProps} />
      case 'template2':
        return <Template2Layout {...commonProps} />
      case 'template3':
        return <Template3Layout {...commonProps} />
      case 'template4':
        return <Template4Layout {...commonProps} />
      case 'template5':
        return <Template5Layout {...commonProps} />
      case 'template6':
        return <Template6Layout {...commonProps} />
      case 'template7':
        return <Template7Layout {...commonProps} />
      case 'template8':
        return <Template8Layout {...commonProps} />
      case 'template9':
        return <Template9Layout {...commonProps} />
      case 'template10':
        return <Template10Layout {...commonProps} />
      default:
        return <Template1Layout {...commonProps} />
    }
  }

  return (
    <div className="w-full">
      {/* Event Details Header */}
      {(eventTitle || eventDate || eventNotes || eventMood) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-2 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-lg p-2 border border-pink-200"
        >
          {/* Small Soundtrack Play Button (top-right) */}
          {playableAudioUrl ? (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center text-xs shadow-xs active:scale-95 transition-transform"
              title={isPlaying ? 'Pause Song' : 'Play Song'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          ) : spotifyTrackId ? (
            <a
              href={`https://open.spotify.com/track/${spotifyTrackId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white flex items-center justify-center text-xs shadow-xs active:scale-95 transition-transform"
              title="Open in Spotify"
            >
              ▶
            </a>
          ) : null}

          {eventTitle && (
            <h2 className="text-base font-handwriting font-bold text-gray-800 text-center mb-0.5 pr-6 pl-6">
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
      
      {/* The Template Frame */}
      {renderLayout()}

      {/* Navigation Dots Below the Entire Template */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 pb-1">
          {photos.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-pink-300"
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TemplateProps {
  photos: Photo[]
  caption?: string
  eventDate?: string
  eventTitle?: string
  eventNotes?: string
  eventMood?: string
  spotifyUrl?: string
  showDots?: boolean
}

// Template 1: Pink Heart Frame (1:1 Square)
function Template1Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto">
      <Image
        src="/templates/template_1.jpg"
        alt="Template 1"
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-contain pointer-events-none"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center p-[14%]">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 2: Kraft Paper with Dried Flowers at Bottom
function Template2Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[1424/2000] max-w-md mx-auto">
      <Image
        src="/templates/template_2.jpg"
        alt="Template 2"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Kraft paper top area above bottom dried flowers */}
      <div className="absolute top-[10%] bottom-[33%] left-[14%] right-[14%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 3: Journal Notebook Spread
function Template3Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[1333/2000] max-w-md mx-auto">
      <Image
        src="/templates/template_3.jpg"
        alt="Template 3"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Journal page center area */}
      <div className="absolute top-[20%] bottom-[25%] left-[17%] right-[22%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 4: Vintage Framed Photo on Kraft Paper with Flowers
function Template4Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_4.jpeg"
        alt="Template 4"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Fitted inside the horizontal vintage photo frame */}
      <div className="absolute top-[28%] bottom-[34%] left-[4.5%] right-[2%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 5: Red Poppies (Flowers at top & bottom, central horizontal cutout)
function Template5Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_5.jpeg"
        alt="Template 5"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Positioned comfortably down in the middle white cutout and expanded horizontally */}
      <div className="absolute top-[37%] bottom-[25%] -left-[4%] -right-[4%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 6: Floral Romance
function Template6Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[2/3] max-w-md mx-auto">
      <Image
        src="/templates/template_6.jpg"
        alt="Template 6"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center px-[16%] py-[14%] pb-[20%]">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 7: Pink Hibiscus Polaroid Frame (Fitted precisely over polaroid box)
function Template7Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_7.jpeg"
        alt="Template 7"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Positioned higher to cover the polaroid frame box completely */}
      <div className="absolute top-[26%] bottom-[37.5%] left-[17.5%] right-[17.5%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 8: Pink Lilies (Lilies at top & bottom, seamless central horizontal cutout)
function Template8Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_8.jpeg"
        alt="Template 8"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Positioned comfortably down in the middle white cutout and expanded horizontally */}
      <div className="absolute top-[37%] bottom-[25%] -left-[4%] -right-[4%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 9: Hearts Background + White Polaroid with Ribbon Bow
function Template9Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_9.jpeg"
        alt="Template 9"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Inside white polaroid frame area */}
      <div className="absolute top-[18%] bottom-[25.5%] left-[12%] right-[12%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}

// Template 10: Pink Card with Washi Tape & Bouquet
function Template10Layout(props: TemplateProps) {
  if (props.photos.length === 0) return null

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto">
      <Image
        src="/templates/template_10.jpeg"
        alt="Template 10"
        fill
        sizes="(max-width: 768px) 100vw, 450px"
        className="object-contain pointer-events-none"
        priority
      />
      {/* Moved down from top with comfortable padding */}
      <div className="absolute top-[18%] bottom-[24%] left-[16%] right-[16%] flex items-center justify-center">
        <PhotoCarousel {...props} />
      </div>
    </div>
  )
}
