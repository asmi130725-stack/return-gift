'use client'

import { useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import Image from 'next/image'

interface SwipeableGalleryProps {
  images: string[]
  captions?: string[]
  onSwipe?: (index: number) => void
}

export default function SwipeableGallery({
  images,
  captions,
  onSwipe,
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
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
    const newIndex = (currentIndex + newDirection + images.length) % images.length
    setDirection(newDirection)
    setCurrentIndex(newIndex)
    onSwipe?.(newIndex)
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1)
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1)
    }
  }

  return (
    <div className="relative w-full">
      {/* Gallery Container */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-video overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority={currentIndex === 0}
            />

            {/* Caption Overlay */}
            {captions && captions[currentIndex] && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
                <p className="text-white text-sm sm:text-base font-serif italic">
                  "{captions[currentIndex]}"
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:block">
          <button
            onClick={() => paginate(-1)}
            className="
              absolute left-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full bg-white/80 backdrop-blur
              flex items-center justify-center
              hover:bg-white transition-colors shadow-lg
            "
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => paginate(1)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full bg-white/80 backdrop-blur
              flex items-center justify-center
              hover:bg-white transition-colors shadow-lg
            "
            aria-label="Next photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Swipe Indicator (Mobile) */}
      <div className="mt-4 flex justify-center gap-1 md:hidden">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Swipe to browse
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </p>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
              onSwipe?.(index)
            }}
            className={`
              h-2 rounded-full transition-all duration-300
              ${
                index === currentIndex
                  ? 'w-8 bg-pink-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }
            `}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Photo Counter */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full backdrop-blur">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
