'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { isValidImageType, formatFileSize, convertHeicToJpeg, isHeicFile } from '@/lib/utils'

interface PhotoUploadProps {
  onPhotosSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
}

export default function PhotoUpload({
  onPhotosSelected,
  maxFiles = 20,
  maxSize = 10 * 1024 * 1024, // 10MB
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [converting, setConverting] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('')
      setConverting(true)

      try {
        // Validate file types
        const validFiles = acceptedFiles.filter((file) => {
          if (!isValidImageType(file)) {
            setError('Some files were skipped. Please upload only images (JPEG, PNG, WebP, HEIC).')
            return false
          }
          if (file.size > maxSize) {
            setError(`Some files were skipped. Maximum file size is ${formatFileSize(maxSize)}.`)
            return false
          }
          return true
        })

        if (validFiles.length === 0) {
          setConverting(false)
          return
        }

        // Check total count
        if (previews.length + validFiles.length > maxFiles) {
          setError(`Maximum ${maxFiles} photos allowed.`)
          setConverting(false)
          return
        }

        // Convert HEIC files to JPEG
        const processedFiles = await Promise.all(
          validFiles.map(async (file) => {
            if (isHeicFile(file)) {
              try {
                console.log('Detected HEIC file, converting:', file.name)
                const converted = await convertHeicToJpeg(file)
                console.log('Conversion successful for:', file.name)
                return converted
              } catch (err) {
                console.error('HEIC conversion failed for file:', file.name, err)
                setError(`Failed to convert ${file.name}. The HEIC format may not be supported. Please try uploading as JPEG or PNG.`)
                return null
              }
            }
            return file
          })
        )

        // Filter out any failed conversions
        const successfulFiles = processedFiles.filter((file): file is File => file !== null)

        if (successfulFiles.length === 0) {
          setConverting(false)
          return
        }

        // Create preview URLs
        const newPreviews = successfulFiles.map((file: File) => URL.createObjectURL(file))
        setPreviews((prev) => [...prev, ...newPreviews])
        
        onPhotosSelected(successfulFiles)
      } catch (err) {
        console.error('Error processing files:', err)
        setError('Failed to process images. Please try again.')
      } finally {
        setConverting(false)
      }
    },
    [maxFiles, maxSize, onPhotosSelected, previews.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
    },
    maxFiles,
    multiple: true,
    disabled: converting,
  })

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-3 border-dashed rounded-2xl p-8 sm:p-12 
          transition-all duration-200
          ${converting ? 'cursor-wait opacity-70' : 'cursor-pointer'}
          ${
            isDragActive
              ? 'border-pink-400 bg-pink-50'
              : 'border-gray-300 bg-gray-50 hover:border-pink-300 hover:bg-pink-25'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="mb-4"
          >
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-pink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>

          {/* Text */}
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
            {converting ? 'Converting images...' : isDragActive ? 'Drop your photos here' : 'Tap to upload photos'}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            {converting ? 'Please wait' : 'or drag and drop'}
          </p>
          <p className="text-xs text-gray-400">
            JPEG, PNG, WebP, HEIC up to {formatFileSize(maxSize)} • Max {maxFiles} photos
          </p>

          {/* Mobile Camera Tip */}
          <p className="mt-4 text-xs text-pink-600 font-medium sm:hidden">
            📸 Tap to choose from gallery or camera
          </p>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Photos ({previews.length})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {previews.map((preview, index) => (
              <motion.div
                key={preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square group"
              >
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => removePreview(index)}
                  className="
                    absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7
                    bg-red-500 text-white rounded-full
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity
                    shadow-lg
                  "
                  aria-label="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Order Number */}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
