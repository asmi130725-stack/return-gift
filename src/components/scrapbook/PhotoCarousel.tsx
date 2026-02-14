'use client'

import { useState, useEffect } from 'react'
import { Photo } from '@/types'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoCarouselProps {
  photos: Photo[]
  onPhotosChange?: (currentPhotos: Photo[]) => void
}

export default function PhotoCarousel({ photos, onPhotosChange }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

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

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => (prev + newDirection + photos.length) % photos.length)
  }

  const goToPhoto = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="w-full">
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
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
            className="relative w-full aspect-square cursor-grab active:cursor-grabbing"
          >
            {currentPhoto.url.toLowerCase().endsWith('.mp4') || 
             currentPhoto.url.toLowerCase().endsWith('.webm') || 
             currentPhoto.url.toLowerCase().endsWith('.mov') ? (
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

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 rounded-full p-2 transition-all"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => paginate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 rounded-full p-2 transition-all"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToPhoto(index)}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-pink-600 w-3 h-3'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
