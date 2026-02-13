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
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                            fileName.endsWith('.png') || fileName.endsWith('.webp') || 
                            fileName.endsWith('.heic') || fileName.endsWith('.heif')
  
  return validTypes.includes(file.type) || hasValidExtension
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
 * Check if a file is HEIC format
 */
export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const isHeicExtension = fileName.endsWith('.heic') || fileName.endsWith('.heif')
  const isHeicType = file.type === 'image/heic' || file.type === 'image/heif'
  return isHeicExtension || isHeicType
}

/**
 * Convert HEIC image to JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log('Starting HEIC conversion for:', file.name, 'Type:', file.type, 'Size:', file.size)
    
    // Dynamic import to reduce bundle size
    let heic2any
    try {
      heic2any = (await import('heic2any')).default
      console.log('heic2any library loaded successfully')
    } catch (importError) {
      console.error('Failed to import heic2any library:', importError)
      throw new Error('HEIC converter library failed to load. Please try uploading as JPEG or PNG.')
    }

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })

    // heic2any can return Blob or Blob[], handle both cases
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

    // Create a new File object from the converted blob
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const convertedFile = new File([blob], fileName, { type: 'image/jpeg' })
    
    console.log('HEIC conversion successful:', convertedFile.name, 'New size:', convertedFile.size)
    return convertedFile
  } catch (error) {
    console.error('HEIC conversion error details:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      error: error
    })
    throw error
  }
}
