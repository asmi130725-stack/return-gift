'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { extractSpotifyTrackId, parseSoundtrackData, SoundtrackData } from '@/components/music/SpotifySongSelector'

interface SoundtrackPlayerProps {
  data: string
}

export default function SoundtrackPlayer({ data }: SoundtrackPlayerProps) {
  const [soundtrack, setSoundtrack] = useState<SoundtrackData>(() => parseSoundtrackData(data))
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(30)
  const [isDragging, setIsDragging] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Auto-resolve missing metadata from Spotify oEmbed
  useEffect(() => {
    const initial = parseSoundtrackData(data)
    setSoundtrack(initial)

    const rawUrl = initial.url || data

    if (rawUrl && (rawUrl.includes('spotify.com') || rawUrl.startsWith('spotify:')) && (!initial.title || initial.title === 'Spotify Track' || initial.title === 'Linked Song')) {
      const cleanSpotifyUrl = rawUrl.startsWith('http') ? rawUrl : `https://open.spotify.com/track/${extractSpotifyTrackId(rawUrl)}`
      fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanSpotifyUrl)}`)
        .then(res => res.json())
        .then(oembed => {
          if (oembed && oembed.title) {
            setSoundtrack(prev => ({
              ...prev,
              title: oembed.title,
              artist: oembed.author_name || 'Spotify Track',
              artwork: oembed.thumbnail_url || prev.artwork,
            }))
          }
        })
        .catch(err => console.warn('Spotify oembed error:', err))
    }
  }, [data])

  const spotifyTrackId = extractSpotifyTrackId(soundtrack.url) || extractSpotifyTrackId(data)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
    }
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const handleError = () => setHasError(true)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [soundtrack.previewUrl, soundtrack.url, isDragging])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
        setHasError(false)
      }).catch(err => {
        console.warn('Audio play failed:', err)
        setHasError(true)
      })
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setCurrentTime(val)
    if (audioRef.current) {
      audioRef.current.currentTime = val
    }
  }

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const playableAudioUrl = soundtrack.previewUrl || (soundtrack.url.endsWith('.mp3') || soundtrack.url.includes('apple') ? soundtrack.url : null)

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm max-w-xl mx-auto"
    >
      <div className="flex items-center gap-3">
        {/* Album Artwork / Disc */}
        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-xs border border-pink-100 bg-pink-50">
          {soundtrack.artwork ? (
            <img
              src={soundtrack.artwork}
              alt={soundtrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : ''
              }`}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-xl ${
              isPlaying ? 'animate-spin [animation-duration:4s]' : ''
            }`}>
              💿
            </div>
          )}
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate flex items-center gap-1.5">
                <span>{soundtrack.title || 'Soundtrack'}</span>
                {isPlaying && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <span className="w-1 h-2.5 bg-pink-500 rounded-full animate-bounce" />
                    <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 truncate font-medium">
                {soundtrack.artist || 'Memory Soundtrack'}
              </p>
            </div>

            {spotifyTrackId && (
              <a
                href={soundtrack.url.startsWith('http') ? soundtrack.url : `https://open.spotify.com/track/${spotifyTrackId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#15803d] text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Spotify</span>
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Interactive Responsive Scrubber */}
          {playableAudioUrl ? (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-mono select-none">
                {formatTime(currentTime)}
              </span>
              
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 30}
                  step="0.05"
                  value={currentTime}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                  onChange={handleSliderChange}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${progressPercent}%, #fce7f3 ${progressPercent}%, #fce7f3 100%)`
                  }}
                />
              </div>

              <span className="text-[9px] text-gray-400 font-mono select-none">
                {formatTime(duration)}
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-pink-600 font-medium">
              Linked from Spotify
            </div>
          )}
        </div>

        {/* Play / Pause Action Button */}
        {playableAudioUrl ? (
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center transition-all shadow-md active:scale-90 shrink-0 font-bold text-sm"
            title={isPlaying ? 'Pause' : 'Play Soundtrack'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        ) : spotifyTrackId ? (
          <a
            href={`https://open.spotify.com/track/${spotifyTrackId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 text-sm font-bold"
            title="Open in Spotify"
          >
            ▶
          </a>
        ) : null}
      </div>

      {/* Hidden Audio Element */}
      {playableAudioUrl && (
        <audio
          ref={audioRef}
          src={playableAudioUrl}
          preload="metadata"
        />
      )}
    </motion.div>
  )
}
