import { useState, useEffect } from 'react'

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /mobile|android|iphone|ipad|phone/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
} 