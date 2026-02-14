'use client'

import { useState, useRef, useEffect } from 'react'
import { getRandomBackgroundMusic, MoodType } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface BackgroundMusicProps {
  mood?: MoodType
  autoPlay?: boolean
}

export default function BackgroundMusic({ mood, autoPlay = false }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(() => getRandomBackgroundMusic(mood))
  const [volume, setVolume] = useState(0.3)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    if (autoPlay) {
      setIsPlaying(true)
    }
  }, [autoPlay])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Failed to play audio:', err)
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNextSong = () => {
    const newSong = getRandomBackgroundMusic(mood)
    setCurrentSong(newSong)
    if (audioRef.current) {
      audioRef.current.src = newSong.url
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Failed to play audio:', err)
        })
      }
    }
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-4 sm:right-4 z-40">
      <audio
        ref={audioRef}
        src={currentSong.url}
        loop
        crossOrigin="anonymous"
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64"
          >
            {/* Song Info */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Now Playing</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-600">
                {currentSong.mood.charAt(0).toUpperCase() + currentSong.mood.slice(1)} mood
              </p>
            </div>

            {/* Volume Control */}
            <div className="mb-4">
              <label className="text-xs text-gray-600 uppercase tracking-wide block mb-2">
                Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={handlePlayPause}
                className="flex-1 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={handleNextSong}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                🔀 Next
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowControls(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Button */}
      <motion.button
        onClick={() => setShowControls(!showControls)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl transition-all ${
          isPlaying
            ? 'bg-pink-600 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        {isPlaying ? '♪' : '♫'}
      </motion.button>
    </div>
  )
}
