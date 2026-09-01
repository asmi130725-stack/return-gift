'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SoundtrackData {
  title: string
  artist: string
  artwork?: string
  url: string
  previewUrl?: string
}

interface SpotifySongSelectorProps {
  value?: string
  onChange: (serializedData: string) => void
}

interface SearchResult {
  trackId: number | string
  trackName: string
  artistName: string
  artworkUrl100: string
  previewUrl?: string
  spotifyUrl?: string
}

export function extractSpotifyTrackId(url: string): string | null {
  if (!url) return null
  const trackMatch = url.match(/track[\/:]([a-zA-Z0-9]+)/)
  return trackMatch ? trackMatch[1] : null
}

export function parseSoundtrackData(raw?: string): SoundtrackData {
  if (!raw) {
    return { title: '', artist: '', url: '' }
  }

  // If JSON format
  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw)
      return {
        title: parsed.title || 'Linked Song',
        artist: parsed.artist || 'Soundtrack',
        artwork: parsed.artwork,
        url: parsed.url || '',
        previewUrl: parsed.previewUrl,
      }
    } catch {
      // Fallback
    }
  }

  const spotifyTrackId = extractSpotifyTrackId(raw)
  if (spotifyTrackId) {
    return {
      title: 'Spotify Track',
      artist: 'Linked Song',
      url: raw,
    }
  }

  if (raw.startsWith('http')) {
    return {
      title: 'Linked Soundtrack',
      artist: 'Audio Track',
      url: raw,
      previewUrl: raw,
    }
  }

  return { title: raw, artist: 'Soundtrack', url: raw }
}

export default function SpotifySongSelector({ value = '', onChange }: SpotifySongSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSong, setSelectedSong] = useState<SoundtrackData | null>(() => {
    if (!value) return null
    const parsed = parseSoundtrackData(value)
    return parsed.url || parsed.title ? parsed : null
  })
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null)

  // Sync selected song whenever value prop updates
  useEffect(() => {
    if (value) {
      const parsed = parseSoundtrackData(value)
      if (parsed.url || parsed.title) {
        setSelectedSong(parsed)

        // If Spotify link without rich title, resolve via oEmbed
        const rawUrl = parsed.url || value
        if (rawUrl && (rawUrl.includes('spotify.com') || rawUrl.startsWith('spotify:')) && (!parsed.title || parsed.title === 'Spotify Track' || parsed.title === 'Linked Song')) {
          const cleanSpotifyUrl = rawUrl.startsWith('http') ? rawUrl : `https://open.spotify.com/track/${extractSpotifyTrackId(rawUrl)}`
          fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanSpotifyUrl)}`)
            .then(res => res.json())
            .then(oembed => {
              if (oembed && oembed.title) {
                const enriched: SoundtrackData = {
                  title: oembed.title,
                  artist: oembed.author_name || 'Spotify',
                  artwork: oembed.thumbnail_url || parsed.artwork,
                  url: cleanSpotifyUrl,
                  previewUrl: parsed.previewUrl,
                }
                setSelectedSong(enriched)
                onChange(JSON.stringify(enriched))
              }
            })
            .catch(err => console.warn('Spotify oembed error:', err))
        }
      }
    } else {
      setSelectedSong(null)
    }
  }, [value])

  // Search iTunes / Song API (free & fast)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=5`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(
            (data.results || []).map((item: any) => ({
              trackId: item.trackId,
              trackName: item.trackName,
              artistName: item.artistName,
              artworkUrl100: item.artworkUrl100,
              previewUrl: item.previewUrl,
              spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${item.trackName} ${item.artistName}`)}`,
            }))
          )
        }
      } catch (err) {
        console.error('Music search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectSong = (song: SearchResult) => {
    const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(`${song.trackName} ${song.artistName}`)}`
    const songData: SoundtrackData = {
      title: song.trackName,
      artist: song.artistName,
      artwork: song.artworkUrl100,
      url: spotifyLink,
      previewUrl: song.previewUrl,
    }
    setSelectedSong(songData)
    onChange(JSON.stringify(songData))
    setResults([])
    setQuery('')
    stopPreview()
  }

  const handlePasteDirectUrl = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    const trackId = extractSpotifyTrackId(trimmed)
    const songData: SoundtrackData = {
      title: trackId ? 'Spotify Track' : 'Linked Song',
      artist: trackId ? 'Spotify' : 'Custom Soundtrack',
      url: trimmed,
      previewUrl: trimmed.endsWith('.mp3') ? trimmed : undefined,
    }
    setSelectedSong(songData)
    onChange(JSON.stringify(songData))
    setQuery('')
    setResults([])
  }

  const handleRemoveSong = () => {
    stopPreview()
    setSelectedSong(null)
    onChange('')
  }

  const togglePreview = (previewUrl?: string) => {
    if (!previewUrl) return

    if (playingPreviewUrl === previewUrl) {
      stopPreview()
    } else {
      stopPreview()
      const audio = new Audio(previewUrl)
      audio.volume = 0.5
      audio.play().catch(e => console.warn(e))
      audio.onended = () => setPlayingPreviewUrl(null)
      setPreviewAudio(audio)
      setPlayingPreviewUrl(previewUrl)
    }
  }

  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause()
      setPreviewAudio(null)
    }
    setPlayingPreviewUrl(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
          <span>🎵</span> Soundtrack
        </label>
        <span className="text-[11px] text-pink-500 font-medium">
          Spotify / Audio
        </span>
      </div>

      {selectedSong && (selectedSong.title || selectedSong.url) ? (
        /* Selected Song Preview Card */
        <div className="p-3 bg-gradient-to-r from-pink-50/90 via-rose-50/60 to-amber-50/50 border border-pink-200/90 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {selectedSong.artwork ? (
              <img
                src={selectedSong.artwork}
                alt={selectedSong.title}
                className="w-11 h-11 rounded-xl object-cover shadow-xs shrink-0 border border-pink-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                🎶
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="bg-[#1DB954] text-white text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Spotify
                </span>
              </div>
              <h5 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                {selectedSong.title}
              </h5>
              <p className="text-[11px] text-gray-500 truncate">
                {selectedSong.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {selectedSong.previewUrl && (
              <button
                type="button"
                onClick={() => togglePreview(selectedSong.previewUrl)}
                className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full transition-colors border border-pink-200 shadow-xs"
              >
                {playingPreviewUrl === selectedSong.previewUrl ? '⏸ Pause' : '▶ Preview'}
              </button>
            )}
            <button
              type="button"
              onClick={handleRemoveSong}
              className="w-7 h-7 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors border border-gray-200 shadow-xs active:scale-95 text-xs font-bold"
              title="Remove Song"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* Search & Direct Link Input */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search song/artist (e.g. Lover, Perfect) or paste Spotify link..."
              value={query}
              onChange={(e) => {
                const val = e.target.value
                setQuery(val)
                if (val.includes('spotify.com/track') || val.includes('spotify:track:')) {
                  handlePasteDirectUrl(val)
                }
              }}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none bg-white transition-all shadow-xs"
            />
            <span className="absolute left-2.5 top-3 text-gray-400 text-xs">
              🔍
            </span>
            {isSearching && (
              <span className="absolute right-3 top-3 text-[11px] text-gray-400 animate-pulse">
                Searching...
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-white rounded-2xl border border-pink-100 shadow-xl overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto"
              >
                {results.map((song) => (
                  <div
                    key={song.trackId}
                    className="p-2 hover:bg-pink-50/60 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={song.artworkUrl100}
                        alt={song.trackName}
                        className="w-9 h-9 rounded-lg object-cover shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-900 truncate">
                          {song.trackName}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {song.artistName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {song.previewUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePreview(song.previewUrl)
                          }}
                          className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold rounded-full transition-colors"
                        >
                          {playingPreviewUrl === song.previewUrl ? '⏸' : '▶'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="px-2.5 py-0.5 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold rounded-full transition-colors"
                      >
                        + Link
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
