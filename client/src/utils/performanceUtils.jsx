import React, { Suspense, lazy } from 'react'

/**
 * Performance utilities for lazy loading and optimization
 */

/**
 * Create a lazy loaded component with fallback
 */
export const lazyWithFallback = (importFunc, fallbackComponent = null) => {
  const LazyComponent = lazy(importFunc)
  
  return (props) => (
    <Suspense 
      fallback={
        fallbackComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Debounce function for performance
 */
export const debounce = (func, delay) => {
  let timeoutId
  return function(...args) {
    const context = this
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(context, args), delay)
  }
}

/**
 * Throttle function for performance
 */
export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Memoization helper for expensive computations
 */
export const memoize = (func) => {
  const cache = new Map()
  
  return (...args) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options
      }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options])
  
  return isIntersecting
}

/**
 * Virtual list hook for rendering large lists efficiently
 */
export const useVirtualList = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  }
}

/**
 * Request Animation Frame wrapper
 */
export const rafSchedule = (callback) => {
  let rafId = null
  let lastArgs = []
  
  const later = (context) => () => {
    rafId = null
    callback.apply(context, lastArgs)
  }
  
  return function(...args) {
    lastArgs = args
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(later(this))
  }
}

/**
 * Check if component should update based on props
 */
export const shouldComponentUpdate = (prevProps, nextProps, compareKeys = []) => {
  if (compareKeys.length === 0) {
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps)
  }
  
  return compareKeys.some(key => prevProps[key] !== nextProps[key])
}

/**
 * Batch state updates for performance
 */
export const batchUpdates = (updates) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
      resolve()
    })
  })
}

/**
 * Preload images for better performance
 */
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(url => 
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
    )
  )
}

/**
 * Web Worker helper for expensive computations
 */
export class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = []
    this.queue = []
    this.poolSize = poolSize
    
    for (let i = 0; i < poolSize; i++) {
      this.workers.push({
        worker: new Worker(workerScript),
        busy: false
      })
    }
  }
  
  execute(data) {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !w.busy)
      
      if (availableWorker) {
        this.runWorker(availableWorker, data, resolve, reject)
      } else {
        this.queue.push({ data, resolve, reject })
      }
    })
  }
  
  runWorker(workerInfo, data, resolve, reject) {
    workerInfo.busy = true
    
    workerInfo.worker.onmessage = (e) => {
      resolve(e.data)
      workerInfo.busy = false
      
      if (this.queue.length > 0) {
        const { data, resolve, reject } = this.queue.shift()
        this.runWorker(workerInfo, data, resolve, reject)
      }
    }
    
    workerInfo.worker.onerror = (error) => {
      reject(error)
      workerInfo.busy = false
    }
    
    workerInfo.worker.postMessage(data)
  }
  
  terminate() {
    this.workers.forEach(w => w.worker.terminate())
  }
}
