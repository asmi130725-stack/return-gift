// TypeScript types for the application

export type MoodType = 'romantic' | 'playful' | 'nostalgic' | 'adventurous' | 'joyful' | 'peaceful'
export type LayoutStyle = 'template1' | 'template2' | 'template3' | 'template6'

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Event {
  id: string
  userId: string
  title: string
  date: Date
  notes?: string
  mood?: MoodType
  layoutStyle?: LayoutStyle
  colorTheme?: string
  aiCaption?: string
  videoUrl?: string
  backgroundMusic?: string
  createdAt: Date
  updatedAt: Date
}

export interface Photo {
  id: string
  eventId: string
  url: string
  publicId: string
  order: number
  mediaType?: 'image' | 'video' // 'image' is default for backwards compatibility
  // Pixel-based positioning (relative to 1200x1600 canvas)
  positionX?: number  // pixels
  positionY?: number  // pixels
  width?: number      // pixels
  height?: number     // pixels
  scale?: number
  rotation?: number
  cropData?: {
    x: number         // pixels relative to natural image
    y: number         // pixels relative to natural image
    width: number     // pixels
    height: number    // pixels
  }
  aiGeneratedCaption?: string
  uploadedAt: Date
}

export interface AIPhotoAnalysis {
  subject: string
  mood: string
  theme: string
  colors: string[]
}

export interface DecorativeElements {
  border: string
  stickers: string[]
  background: string
  font: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export const THEMES: Record<MoodType, ThemeColors> = {
  romantic: {
    primary: '#FF6B9D',
    secondary: '#C44569',
    accent: '#FFE66D',
    background: '#FFF5F7',
    text: '#2C1810',
  },
  playful: {
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    accent: '#FFE66D',
    background: '#F7FFF7',
    text: '#1A1A2E',
  },
  nostalgic: {
    primary: '#D4A574',
    secondary: '#8B7355',
    accent: '#E8D5C4',
    background: '#FAF7F2',
    text: '#3E2723',
  },
  adventurous: {
    primary: '#2E86AB',
    secondary: '#A23B72',
    accent: '#F18F01',
    background: '#F6F8FF',
    text: '#1B263B',
  },
  joyful: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#84CC16',
    background: '#F0FDF4',
    text: '#064E3B',
  },
  peaceful: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#C4B5FD',
    background: '#F5F3FF',
    text: '#4C1D95',
  },
}
// Background Music Library for memories
export const BACKGROUND_MUSIC = [
  {
    id: 'soft-piano-1',
    title: 'Gentle Piano',
    mood: 'romantic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'acoustic-love',
    title: 'Acoustic Love',
    mood: 'romantic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'dreamy-strings',
    title: 'Dreamy Strings',
    mood: 'nostalgic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'joyful-ukulele',
    title: 'Joyful Ukulele',
    mood: 'joyful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'playful-bells',
    title: 'Playful Bells',
    mood: 'playful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 'calm-meditation',
    title: 'Calm Meditation',
    mood: 'peaceful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
]

export function getRandomBackgroundMusic(mood?: MoodType): typeof BACKGROUND_MUSIC[0] {
  if (mood) {
    const moodMusic = BACKGROUND_MUSIC.filter(m => m.mood === mood)
    if (moodMusic.length > 0) {
      return moodMusic[Math.floor(Math.random() * moodMusic.length)]
    }
  }
  return BACKGROUND_MUSIC[Math.floor(Math.random() * BACKGROUND_MUSIC.length)]
}