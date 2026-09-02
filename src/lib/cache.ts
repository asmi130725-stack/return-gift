/**
 * Lightweight client-side memory & session cache to prevent redundant API refetches
 * and instant image preloading to prevent blink/blank states during carousels.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const preloadedImageCache = new Set<string>()

// 5 minutes default cache time
const DEFAULT_TTL = 5 * 60 * 1000

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cacheKey = url

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T
  }

  // 2. Check sessionStorage if available
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`cache_${cacheKey}`)
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored)
        if (Date.now() - parsed.timestamp < ttl) {
          memoryCache.set(cacheKey, parsed)
          return parsed.data
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }

  // 3. Network fetch
  const response = await fetch(url, options)
  if (!response.ok) {
    // If network fails but we had stale cached data, return it as fallback
    if (cached) return cached.data as T
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()

  // 4. Save to cache
  const entry: CacheEntry<T> = { data, timestamp: Date.now() }
  memoryCache.set(cacheKey, entry)

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify(entry))
    } catch {
      // Quota exceeded, ignore
    }
  }

  return data
}

export function invalidateCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear()
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(sessionStorage)
        for (const k of keys) {
          if (k.startsWith('cache_')) sessionStorage.removeItem(k)
        }
      } catch {}
    }
    return
  }

  for (const key of memoryCache.keys()) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key)
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(sessionStorage)
      for (const k of keys) {
        if (k.includes(urlPrefix)) sessionStorage.removeItem(k)
      }
    } catch {}
  }
}

/**
 * Preloads image URLs into browser cache & memory so swiping is seamless with 0ms lag.
 */
export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach((url) => {
    if (!url || preloadedImageCache.has(url)) return
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) return

    const img = new window.Image()
    img.src = url
    img.onload = () => preloadedImageCache.add(url)
  })
}
