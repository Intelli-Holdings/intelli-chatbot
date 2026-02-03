'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToBottomButtonProps {
  targetRef: React.RefObject<HTMLElement>
  className?: string
  threshold?: number
  alwaysShow?: boolean // New prop to control visibility behavior
}

export function ScrollToBottomButton({
  targetRef,
  className,
  threshold = 100,
  alwaysShow = false // Default to false - button disappears at bottom
}: ScrollToBottomButtonProps) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Find the scrollable container (the chat area)
    const scrollContainer = targetRef.current?.closest('.overflow-y-auto')

    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      
      // Show button when user has scrolled up a certain amount
      if (alwaysShow) {
        setShowButton(true) // Always show if alwaysShow is true
      } else {
        setShowButton(distanceFromBottom > threshold)
      }
    }

    // Initial check
    handleScroll()
    
    scrollContainer.addEventListener('scroll', handleScroll)
    
    // Also check when window resizes
    window.addEventListener('resize', handleScroll)
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
    }
  }, [targetRef, threshold, alwaysShow])

  const scrollToBottom = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToBottom}
      className={cn(
        'fixed bottom-24 right-9 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50',
        showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        className
      )}
      aria-label="Scroll to latest message"
    >
      <ChevronDown className="h-5 w-5 text-gray-600" />
    </button>
  )
}