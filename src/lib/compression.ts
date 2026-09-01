import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  initialQuality?: number
  fileType?: string
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // Max 1MB
  maxWidthOrHeight: 1920, // Max 1080p/2K resolution
  useWebWorker: true,
  initialQuality: 0.82,
  fileType: 'image/webp',
}

/**
 * Compresses an image file with high fidelity and aggressive file size reduction (WebP format).
 * Returns original file if it is a video or compression fails.
 */
export async function compressImage(
  file: File,
  customOptions?: CompressionOptions
): Promise<File> {
  // Pass non-image files (like MP4/WebM videos) through untouched
  if (!file.type.startsWith('image/')) {
    return file
  }

  const options = {
    ...DEFAULT_OPTIONS,
    ...customOptions,
  }

  try {
    const compressedBlob = await imageCompression(file, options)
    
    // Ensure filename has proper extension if converted to webp
    let newFileName = file.name
    if (options.fileType === 'image/webp' && !newFileName.toLowerCase().endsWith('.webp')) {
      newFileName = newFileName.replace(/\.[^/.]+$/, '') + '.webp'
    }

    return new File([compressedBlob], newFileName, {
      type: options.fileType || file.type,
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn(`Compression fallback for ${file.name}:`, error)
    return file
  }
}

/**
 * Compresses a batch of files concurrently.
 */
export async function compressFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = []
  for (let i = 0; i < files.length; i++) {
    const res = await compressImage(files[i])
    compressed.push(res)
    if (onProgress) {
      onProgress(i + 1, files.length)
    }
  }
  return compressed
}
