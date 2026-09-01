'use client'

import { useState, useEffect, useCallback } from 'react'
import { Photo } from '@/types'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { parseSoundtrackData, extractSpotifyTrackId, SoundtrackData } from '@/components/music/SpotifySongSelector'

interface PhotoCarouselProps {
  photos: Photo[]
  onPhotosChange?: (currentPhotos: Photo[]) => void
  caption?: string
  eventDate?: string
  eventTitle?: string
  eventNotes?: string
  eventMood?: string
  spotifyUrl?: string
  showDots?: boolean
}

export default function PhotoCarousel({
  photos,
  onPhotosChange,
  caption,
  eventDate,
  eventTitle,
  eventNotes,
  eventMood,
  spotifyUrl,
  showDots = false,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [soundtrack, setSoundtrack] = useState<SoundtrackData | null>(() => {
    if (!spotifyUrl) return null
    return parseSoundtrackData(spotifyUrl)
  })

  useEffect(() => {
    if (spotifyUrl) {
      const parsed = parseSoundtrackData(spotifyUrl)
      setSoundtrack(parsed)

      const rawUrl = parsed.url || spotifyUrl
      if (rawUrl && (rawUrl.includes('spotify.com') || rawUrl.startsWith('spotify:')) && (!parsed.title || parsed.title === 'Spotify Track' || parsed.title === 'Linked Song')) {
        const cleanSpotifyUrl = rawUrl.startsWith('http') ? rawUrl : `https://open.spotify.com/track/${extractSpotifyTrackId(rawUrl)}`
        fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanSpotifyUrl)}`)
          .then(res => res.json())
          .then(oembed => {
            if (oembed && oembed.title) {
              setSoundtrack(prev => ({
                title: oembed.title,
                artist: oembed.author_name || 'Spotify',
                artwork: oembed.thumbnail_url || prev?.artwork,
                url: cleanSpotifyUrl,
              }))
            }
          })
          .catch(err => console.warn('Spotify oembed error:', err))
      }
    }
  }, [spotifyUrl])

  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => (prev + newDirection + photos.length) % photos.length)
  }, [photos.length])

  const goToPhoto = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        paginate(1)
      } else if (e.key === 'ArrowLeft') {
        paginate(-1)
      } else if (e.key === 'Escape' && isEnlarged) {
        setIsEnlarged(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paginate, isEnlarged])

  if (!photos || photos.length === 0) return null

  const currentPhoto = photos[currentIndex] || photos[0]

  const isCurrentVideo = 
    currentPhoto.url.toLowerCase().endsWith('.mp4') || 
    currentPhoto.url.toLowerCase().endsWith('.webm') || 
    currentPhoto.url.toLowerCase().endsWith('.mov')

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <>
      {/* Standard Scrapbook Carousel Normal View (Fills inner template frame perfectly) */}
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xs">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragElastic={1}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            onTap={() => setIsEnlarged(true)}
            onClick={() => setIsEnlarged(true)}
            className="absolute inset-0 cursor-pointer active:cursor-grabbing"
            title="Click photo to view full size"
          >
            {isCurrentVideo ? (
              <video
                src={currentPhoto.url}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <Image
                src={currentPhoto.url}
                alt={`Photo ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Top-Right Expand Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsEnlarged(true)
          }}
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Expand to Full View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                paginate(-1)
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/75 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                paginate(1)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/75 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        {/* Optional Embedded Dots */}
        {showDots && photos.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  goToPhoto(index)
                }}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-pink-600 w-3 h-3'
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enlarged Immersive Full View Modal with Title, Date, Description & AI Quote */}
      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none"
          >
            {/* Top Header Bar: Title, Date, Mood, Counter & Close */}
            <div className="px-4 py-3.5 sm:px-6 flex items-center justify-between z-30 text-white border-b border-white/10 bg-black/40">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {eventTitle && (
                    <h3 className="font-handwriting font-bold text-base sm:text-lg text-white">
                      {eventTitle}
                    </h3>
                  )}
                  {eventMood && (
                    <span className="text-xs text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full font-medium capitalize">
                      {eventMood}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {formattedDate && (
                    <span className="text-xs text-pink-300 font-medium tracking-wide">
                      📅 {formattedDate}
                    </span>
                  )}
                  {soundtrack && (soundtrack.title || soundtrack.url) && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[11px] font-medium border border-white/10">
                      <svg className="w-3 h-3 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                      <span className="truncate max-w-[170px] text-pink-100 font-semibold">{soundtrack.title || 'Soundtrack'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {photos.length > 1 && (
                  <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full text-white/90">
                    {currentIndex + 1} / {photos.length}
                  </span>
                )}
                <button
                  onClick={() => setIsEnlarged(false)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors text-sm font-bold active:scale-95"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Stage: Natural uncropped photo view */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={`enlarged-${currentIndex}`}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragElastic={0.8}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x)
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1)
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1)
                    }
                  }}
                  className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  {isCurrentVideo ? (
                    <video
                      src={currentPhoto.url}
                      className="max-h-[64vh] max-w-full rounded-2xl object-contain shadow-2xl"
                      controls
                      autoPlay
                    />
                  ) : (
                    <div className="relative w-full h-full max-h-[64vh] flex items-center justify-center">
                      <Image
                        src={currentPhoto.url}
                        alt={`Photo ${currentIndex + 1}`}
                        fill
                        className="object-contain drop-shadow-2xl rounded-2xl"
                        priority
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows for Full View */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => paginate(-1)}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl active:scale-90"
                    title="Previous Photo"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => paginate(1)}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl active:scale-90"
                    title="Next Photo"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Bottom Card: Description, AI Quote & Thumbnails */}
            <div className="px-4 py-3 sm:px-6 z-30 bg-black/50 border-t border-white/10 flex flex-col items-center gap-2 max-w-xl mx-auto w-full">
              {/* Description Note */}
              {eventNotes && (
                <p className="text-xs text-white/80 italic text-center leading-relaxed">
                  "{eventNotes}"
                </p>
              )}

              {/* AI Quote */}
              {caption && (
                <div className="w-full text-center px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                  <p className="text-xs sm:text-sm font-serif italic text-pink-200 leading-relaxed">
                    💝 "{caption}"
                  </p>
                </div>
              )}

              {/* Dots in Lightbox */}
              {photos.length > 1 && (
                <div className="flex justify-center gap-2 pt-1">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPhoto(index)}
                      className={`rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-pink-400 w-4 h-2'
                          : 'bg-white/30 hover:bg-white/60 w-2 h-2'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
