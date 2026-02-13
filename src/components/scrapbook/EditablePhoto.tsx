'use client'

import { Photo } from '@/types'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { 
  DEFAULT_POSITIONS, 
  DEFAULT_PHOTO_WIDTH, 
  DEFAULT_PHOTO_HEIGHT,
  clampToCanvas,
  getCanvasScale
} from '@/lib/canvas'

interface EditablePhotoProps {
  photo: Photo
  isEditMode: boolean
  onUpdate: (photoId: string, updates: {
    positionX?: number
    positionY?: number
    width?: number
    height?: number
    scale?: number
    rotation?: number
  }) => void
  index?: number
  className?: string
  style?: React.CSSProperties
}

export default function EditablePhoto({
  photo,
  isEditMode,
  onUpdate,
  index = 0,
  className = '',
  style,
}: EditablePhotoProps) {
  // Use pixel coordinates from canvas defaults
  const defaultPos = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length]
  
  const [localPosition, setLocalPosition] = useState({
    x: photo.positionX !== undefined ? photo.positionX : defaultPos.x,
    y: photo.positionY !== undefined ? photo.positionY : defaultPos.y,
  })
  const [localSize, setLocalSize] = useState({
    width: photo.width || DEFAULT_PHOTO_WIDTH,
    height: photo.height || DEFAULT_PHOTO_HEIGHT,
  })
  const [localScale, setLocalScale] = useState(photo.scale || 1)
  const [localRotation, setLocalRotation] = useState(photo.rotation || 0)
  const [isSelected, setIsSelected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPosition = useRef({ x: 0, y: 0 })
  const canvasScaleRef = useRef(1)

  // Update local state when photo prop changes
  useEffect(() => {
    setLocalPosition({ 
      x: photo.positionX !== undefined ? photo.positionX : defaultPos.x, 
      y: photo.positionY !== undefined ? photo.positionY : defaultPos.y 
    })
    setLocalSize({
      width: photo.width || DEFAULT_PHOTO_WIDTH,
      height: photo.height || DEFAULT_PHOTO_HEIGHT,
    })
    setLocalScale(photo.scale || 1)
    setLocalRotation(photo.rotation || 0)
  }, [photo.positionX, photo.positionY, photo.width, photo.height, photo.scale, photo.rotation])

  // Calculate canvas scale for coordinate conversion
  useEffect(() => {
    const updateCanvasScale = () => {
      const container = containerRef.current?.parentElement
      if (container) {
        canvasScaleRef.current = getCanvasScale(container.clientWidth, container.clientHeight)
      }
    }
    
    updateCanvasScale()
    window.addEventListener('resize', updateCanvasScale)
    return () => window.removeEventListener('resize', updateCanvasScale)
  }, [])

  const handleDragStart = () => {
    dragStartPosition.current = { x: localPosition.x, y: localPosition.y }
  }

  const handleDrag = (_event: any, info: any) => {
    // No-op during drag - let Framer Motion handle the visual update
    // We'll calculate final position in handleDragEnd
  }

  const handleDragEnd = (_event: any, info: any) => {
    // Convert screen offset to canvas pixels
    const canvasScale = canvasScaleRef.current
    const offsetX = info.offset.x / canvasScale
    const offsetY = info.offset.y / canvasScale
    
    // Calculate new position in canvas pixels
    const newX = dragStartPosition.current.x + offsetX
    const newY = dragStartPosition.current.y + offsetY
    
    // Clamp to canvas bounds
    const clamped = clampToCanvas(newX, newY, localSize.width, localSize.height)
    
    setLocalPosition({ x: clamped.x, y: clamped.y })
    onUpdate(photo.id, { positionX: clamped.x, positionY: clamped.y })
  }

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.3, Math.min(3, localScale + delta))
    setLocalScale(newScale)
    onUpdate(photo.id, { scale: newScale })
  }

  const handleRotationChange = (delta: number) => {
    const newRotation = (localRotation + delta) % 360
    setLocalRotation(newRotation)
    onUpdate(photo.id, { rotation: newRotation })
  }

  return (
    <motion.div
      ref={containerRef}
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={() => isEditMode && setIsSelected(!isSelected)}
      className={`${className} ${isEditMode ? 'cursor-move' : ''} ${isSelected ? 'ring-4 ring-pink-500 z-50' : 'z-10'}`}
      style={{
        ...style,
        position: 'absolute',
        left: `${localPosition.x}px`,
        top: `${localPosition.y}px`,
        width: `${localSize.width}px`,
        height: `${localSize.height}px`,
        transform: `scale(${localScale}) rotate(${localRotation}deg)`,
        transformOrigin: 'top left',
      }}
      whileHover={isEditMode ? { scale: localScale * 1.05 } : undefined}
    >
      <div className="relative w-full h-full">
        <Image
          src={photo.url}
          alt="Photo"
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>
      
      {/* Edit Controls - Only show when selected in edit mode */}
      {isEditMode && isSelected && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-2 flex gap-2 z-[100] whitespace-nowrap">
          {/* Scale controls */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleScaleChange(-0.1)
            }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
          >
            −
          </button>
          <span className="px-2 py-1 text-sm font-medium min-w-[45px] text-center">{(localScale * 100).toFixed(0)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleScaleChange(0.1)
            }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
          >
            +
          </button>
          
          {/* Rotation controls */}
          <div className="w-px bg-gray-300" />
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRotationChange(-15)
            }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            ↺
          </button>
          <span className="px-2 py-1 text-sm font-medium min-w-[35px] text-center">{Math.round(localRotation)}°</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRotationChange(15)
            }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            ↻
          </button>
        </div>
      )}
    </motion.div>
  )
}
