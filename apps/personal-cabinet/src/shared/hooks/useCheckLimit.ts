import { useState, useEffect } from 'react'

interface LimitConfig {
  maxRequests: number
  timeWindow: number // in milliseconds
  resetTime?: number // timestamp when limit resets
}

interface LimitState {
  current: number
  remaining: number
  resetTime: number
  isExceeded: boolean
}

export const useCheckLimit = (key: string, config: LimitConfig) => {
  const [limitState, setLimitState] = useState<LimitState>(() => {
    const stored = localStorage.getItem(`limit_${key}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      const now = Date.now()
      
      // Check if limit has reset
      if (now > parsed.resetTime) {
        return {
          current: 0,
          remaining: config.maxRequests,
          resetTime: now + config.timeWindow,
          isExceeded: false,
        }
      }
      
      return {
        current: parsed.current,
        remaining: Math.max(0, config.maxRequests - parsed.current),
        resetTime: parsed.resetTime,
        isExceeded: parsed.current >= config.maxRequests,
      }
    }
    
    return {
      current: 0,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.timeWindow,
      isExceeded: false,
    }
  })

  const increment = () => {
    setLimitState(prev => {
      const newCurrent = prev.current + 1
      const newRemaining = Math.max(0, config.maxRequests - newCurrent)
      const newIsExceeded = newCurrent >= config.maxRequests
      
      const newState = {
        current: newCurrent,
        remaining: newRemaining,
        resetTime: prev.resetTime,
        isExceeded: newIsExceeded,
      }
      
      localStorage.setItem(`limit_${key}`, JSON.stringify(newState))
      return newState
    })
  }

  const reset = () => {
    const now = Date.now()
    const newState = {
      current: 0,
      remaining: config.maxRequests,
      resetTime: now + config.timeWindow,
      isExceeded: false,
    }
    
    setLimitState(newState)
    localStorage.setItem(`limit_${key}`, JSON.stringify(newState))
  }

  const checkLimit = (): boolean => {
    if (limitState.isExceeded) {
      return false
    }
    
    increment()
    return true
  }

  // Auto-reset when time window expires
  useEffect(() => {
    const now = Date.now()
    if (now > limitState.resetTime) {
      reset()
    }
  }, [limitState.resetTime])

  return {
    ...limitState,
    increment,
    reset,
    checkLimit,
  }
} 