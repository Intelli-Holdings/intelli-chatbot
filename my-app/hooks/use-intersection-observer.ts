"use client"

import { useEffect, useRef } from "react"

export const useIntersectionObserver = (
  elementRef: Element,
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.1 },
) => {
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observer.current = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting)
    }, options)

    if (elementRef) {
      observer.current.observe(elementRef)
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [elementRef, callback, options])

  return observer.current
}

