"use client"

import { useState, useEffect, useRef } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  fallback: string
  alt: string
  delay?: number
}

// Global queue to control concurrent image loads
let loadQueue: Array<() => void> = []
let activeLoads = 0
const MAX_CONCURRENT_LOADS = 3
const LOAD_DELAY = 300 // ms between batches

function processQueue() {
  if (activeLoads >= MAX_CONCURRENT_LOADS || loadQueue.length === 0) {
    return
  }

  const nextLoad = loadQueue.shift()
  if (nextLoad) {
    activeLoads++
    nextLoad()
    
    // Process next after delay
    setTimeout(() => {
      activeLoads--
      processQueue()
    }, LOAD_DELAY)
  }
}

/**
 * LazyImage component with rate limiting and error handling
 * Limits concurrent Google image loads to avoid 429 rate limit errors
 */
export function LazyImage({ src, fallback, alt, delay = 0, className, ...props }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback)
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    // Set up intersection observer for true lazy loading
    if (!imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !src || src === fallback) return

    // Add to queue instead of loading immediately
    const loadImage = () => {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
      }
      img.onerror = () => {
        setImageSrc(fallback)
      }
      img.src = src
    }

    loadQueue.push(loadImage)
    processQueue()

    return () => {
      // Remove from queue if component unmounts
      loadQueue = loadQueue.filter(fn => fn !== loadImage)
    }
  }, [isVisible, src, fallback])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
