'use client'

import { Photo } from '@/types'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface CroppablePhotoProps {
  photo: Photo
  isEditMode: boolean
  onUpdate: (photoId: string, updates: {
    positionX?: number
    positionY?: number
    scale?: number
    rotation?: number
    cropData?: any
  }) => void
  containerWidth: number
  containerHeight: number
  initialLeft?: number
  initialTop?: number
  initialWidth?: number
  initialHeight?: number
}

type HandleType = 'tl' | 'tr' | 'bl' | 'br' | 'mt' | 'mb' | 'ml' | 'mr' | 'rotate'

export default function CroppablePhoto({
  photo,
  isEditMode,
  onUpdate,
  containerWidth,
  containerHeight,
  initialLeft = 10,
  initialTop = 10,
  initialWidth = 200,
  initialHeight = 200,
}: CroppablePhotoProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  // Position and size in pixels - use lazy initialization
  const [left, setLeft] = useState(() => {
    if (photo.positionX !== undefined && containerWidth > 0) {
      return (photo.positionX / 100) * containerWidth
    }
    return initialLeft
  })
  const [top, setTop] = useState(() => {
    if (photo.positionY !== undefined && containerHeight > 0) {
      return (photo.positionY / 100) * containerHeight
    }
    return initialTop
  })
  const [width, setWidth] = useState(initialWidth)
  const [height, setHeight] = useState(initialHeight)
  const [rotation, setRotation] = useState(photo.rotation || 0)
  
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 })
  const resizeStart = useRef({ x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 })
  const activeHandle = useRef<HandleType | null>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  const MIN_SIZE = 80
  const MAX_SIZE = 600

  // Update positions when container size changes or photo position changes
  useEffect(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      if (photo.positionX !== undefined && photo.positionY !== undefined) {
        setLeft((photo.positionX / 100) * containerWidth)
        setTop((photo.positionY / 100) * containerHeight)
      } else {
        // If no saved position, use initial values
        setLeft(initialLeft)
        setTop(initialTop)
      }
    }
  }, [containerWidth, containerHeight, photo.positionX, photo.positionY, initialLeft, initialTop])

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | HandleType) => {
    if (!isEditMode) return
    e.stopPropagation()
    
    setIsSelected(true)
    
    if (type === 'drag') {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left,
        top,
      }
    } else if (type === 'rotate') {
      activeHandle.current = 'rotate'
      setIsResizing(true)
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        left,
        top,
        width,
        height,
      }
    } else {
      activeHandle.current = type
      setIsResizing(true)
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        left,
        top,
        width,
        height,
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.current.x
      const deltaY = e.clientY - dragStart.current.y
      
      let newLeft = dragStart.current.left + deltaX
      let newTop = dragStart.current.top + deltaY
      
      // Constrain to container bounds
      newLeft = Math.max(0, Math.min(newLeft, containerWidth - width))
      newTop = Math.max(0, Math.min(newTop, containerHeight - height))
      
      setLeft(newLeft)
      setTop(newTop)
    } else if (isResizing && activeHandle.current) {
      handleResize(e, activeHandle.current)
    }
  }

  const handleResize = (e: MouseEvent, handle: HandleType) => {
    const deltaX = e.clientX - resizeStart.current.x
    const deltaY = e.clientY - resizeStart.current.y
    
    if (handle === 'rotate') {
      // Calculate rotation based on mouse position relative to center
      const rect = photoRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const degrees = (angle * 180) / Math.PI + 90
      
      setRotation(degrees)
      return
    }

    let newWidth = resizeStart.current.width
    let newHeight = resizeStart.current.height
    let newLeft = resizeStart.current.left
    let newTop = resizeStart.current.top
    
    const aspectRatio = resizeStart.current.width / resizeStart.current.height

    // Corner handles - maintain aspect ratio
    if (handle === 'br') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width + deltaX))
      newHeight = newWidth / aspectRatio
    } else if (handle === 'bl') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width - deltaX))
      newHeight = newWidth / aspectRatio
      newLeft = resizeStart.current.left + (resizeStart.current.width - newWidth)
    } else if (handle === 'tr') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width + deltaX))
      newHeight = newWidth / aspectRatio
      newTop = resizeStart.current.top + (resizeStart.current.height - newHeight)
    } else if (handle === 'tl') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width - deltaX))
      newHeight = newWidth / aspectRatio
      newLeft = resizeStart.current.left + (resizeStart.current.width - newWidth)
      newTop = resizeStart.current.top + (resizeStart.current.height - newHeight)
    }
    // Edge handles - crop (change size without maintaining aspect ratio)
    else if (handle === 'mr') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width + deltaX))
    } else if (handle === 'ml') {
      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.width - deltaX))
      newLeft = resizeStart.current.left + (resizeStart.current.width - newWidth)
    } else if (handle === 'mb') {
      newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.height + deltaY))
    } else if (handle === 'mt') {
      newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resizeStart.current.height - deltaY))
      newTop = resizeStart.current.top + (resizeStart.current.height - newHeight)
    }

    // Constrain to container bounds
    if (newLeft < 0) {
      newWidth += newLeft
      newLeft = 0
    }
    if (newTop < 0) {
      newHeight += newTop
      newTop = 0
    }
    if (newLeft + newWidth > containerWidth) {
      newWidth = containerWidth - newLeft
    }
    if (newTop + newHeight > containerHeight) {
      newHeight = containerHeight - newTop
    }

    setWidth(newWidth)
    setHeight(newHeight)
    setLeft(newLeft)
    setTop(newTop)
  }

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      // Save to database
      const positionX = (left / containerWidth) * 100
      const positionY = (top / containerHeight) * 100
      
      onUpdate(photo.id, {
        positionX,
        positionY,
        rotation,
      })
    }
    
    setIsDragging(false)
    setIsResizing(false)
    activeHandle.current = null
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return
    e.stopPropagation()
    setIsSelected(true)
  }

  // Deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isEditMode) setIsSelected(false)
    }
    
    if (isSelected) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isSelected, isEditMode])

  return (
    <div
      ref={photoRef}
      onClick={handleClick}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      className={`absolute select-none ${isEditMode ? 'cursor-move' : ''} ${
        isSelected && isEditMode ? 'ring-2 ring-pink-500 shadow-xl' : ''
      }`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        zIndex: isSelected ? 50 : 10,
      }}
    >
      {/* Image */}
      <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={photo.url}
          alt="Photo"
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Resize Handles - Only show when selected in edit mode */}
      {isEditMode && isSelected && (
        <>
          {/* Corner handles - for resizing with aspect ratio */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'tl')}
            className="absolute w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nw-resize"
            style={{ left: '-8px', top: '-8px' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'tr')}
            className="absolute w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-ne-resize"
            style={{ right: '-8px', top: '-8px' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'bl')}
            className="absolute w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-sw-resize"
            style={{ left: '-8px', bottom: '-8px' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'br')}
            className="absolute w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-se-resize"
            style={{ right: '-8px', bottom: '-8px' }}
          />

          {/* Edge handles - for cropping */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'mt')}
            className="absolute w-8 h-3 bg-white border-2 border-pink-500 rounded cursor-n-resize"
            style={{ left: '50%', top: '-6px', transform: 'translateX(-50%)' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'mb')}
            className="absolute w-8 h-3 bg-white border-2 border-pink-500 rounded cursor-s-resize"
            style={{ left: '50%', bottom: '-6px', transform: 'translateX(-50%)' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'ml')}
            className="absolute w-3 h-8 bg-white border-2 border-pink-500 rounded cursor-w-resize"
            style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, 'mr')}
            className="absolute w-3 h-8 bg-white border-2 border-pink-500 rounded cursor-e-resize"
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
          />

          {/* Rotation handle */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
            className="absolute w-6 h-6 bg-pink-500 border-2 border-white rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{ left: '50%', top: '-30px', transform: 'translateX(-50%)' }}
          >
            <span className="text-white text-xs">↻</span>
          </div>
          <div
            className="absolute w-0.5 h-6 bg-pink-500"
            style={{ left: '50%', top: '-24px', transform: 'translateX(-50%)' }}
          />
        </>
      )}
    </div>
  )
}
