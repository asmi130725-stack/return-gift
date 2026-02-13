import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Generate a random ID (for demo purposes)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
  return validTypes.includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Convert HEIC image to JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Dynamic import to reduce bundle size
  const heic2any = (await import('heic2any')).default

  const convertedBlob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  })

  // heic2any can return Blob or Blob[], handle both cases
  const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

  // Create a new File object from the converted blob
  const fileName = file.name.replace(/\.heic$/i, '.jpg')
  return new File([blob], fileName, { type: 'image/jpeg' })
}
