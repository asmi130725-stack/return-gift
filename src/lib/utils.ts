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
 * Convert HEIC image to JPEG using server-side API
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log('Starting server-side HEIC conversion for:', file.name, 'Type:', file.type, 'Size:', file.size)
    
    // Send to server for conversion
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/convert-heic', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`)
    }

    // Get the converted image as a blob
    const blob = await response.blob()
    
    // Create a new File object from the converted blob
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const convertedFile = new File([blob], fileName, { type: 'image/jpeg' })
    
    console.log('HEIC conversion successful:', convertedFile.name, 'Original:', file.size, 'Converted:', convertedFile.size)
    return convertedFile
  } catch (error: any) {
    console.error('HEIC conversion error details:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      error: error
    })
    throw new Error(`Failed to convert HEIC image: ${error.message}`)
  }
}
