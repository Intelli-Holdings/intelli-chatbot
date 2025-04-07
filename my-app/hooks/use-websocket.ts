"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// Export this type so it can be imported elsewhere
export type WebSocketMessage = {
  content: string
  type: string
  sender: string
  timestamp: string
  // Add any other properties that might be in your WebSocket messages
}

// Update the Options interface to include the enabled property
interface Options {
  onOpen?: () => void
  onMessage: (message: WebSocketMessage) => void
  onClose?: () => void
  onError?: (event: Event) => void
  reconnectInterval?: number
  reconnectAttempts?: number
  enabled?: boolean
}

export const useWebSocket = (url: string | null, options: Options) => {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<Event | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectCountRef = useRef<number>(0)

  const reconnectInterval = options.reconnectInterval || 3000
  const reconnectAttempts = options.reconnectAttempts || 10
  const enabled = options.enabled !== undefined ? options.enabled : true // Default to true if not provided

  // Clean up function to properly close connections and clear timeouts
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState !== WebSocket.CLOSING && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close()
      }
      socketRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }
  }, [])

  const connect = useCallback(() => {
    cleanup()
    if (!url || !enabled) return

    try {
      console.log("Connecting to WebSocket:", url)
      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onopen = () => {
        console.log("WebSocket connection established")
        setIsConnected(true)
        setError(null)
        reconnectCountRef.current = 0
        if (options.onOpen) options.onOpen()
      }

      socket.onmessage = (event) => {
        try {
          console.log("WebSocket message received:", event.data)
          const data: WebSocketMessage = JSON.parse(event.data)
          options.onMessage(data)
        } catch (e) {
          console.error("Error parsing WebSocket message:", e)
          options.onMessage({
            content: event.data,
            type: "unknown",
            sender: "unknown",
            timestamp: new Date().toISOString(),
          })
        }
      }

      socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason)
        setIsConnected(false)
        if (event.code === 1000) {
          console.log("Normal closure")
        } else if (event.code === 1006) {
          console.error("Abnormal closure - possible network issue or server unavailable")
        } else if (event.code === 1008 || event.code === 1011) {
          console.error("Policy violation or internal server error")
        }
        if (enabled && reconnectCountRef.current < reconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectCountRef.current + 1}/${reconnectAttempts})...`)
          reconnectCountRef.current += 1
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval)
        }
        if (options.onClose) options.onClose()
      }

      socket.onerror = (event) => {
        console.error("WebSocket error:", event)
        setError(event)
        if (options.onError) options.onError(event)
      }
    } catch (e) {
      console.error("Error creating WebSocket connection:", e)
      setError(e as Event)
      if (enabled && reconnectCountRef.current < reconnectAttempts) {
        console.log(
          `Error connecting. Attempting to reconnect (${reconnectCountRef.current + 1}/${reconnectAttempts})...`,
        )
        reconnectCountRef.current += 1
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval)
      }
    }
  }, [url, enabled, reconnectAttempts, reconnectInterval, options, cleanup])

  useEffect(() => {
    if (enabled && url) {
      connect()
    } else if (!enabled && socketRef.current) {
      cleanup()
    }
    return cleanup
  }, [url, enabled, connect, cleanup])

  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (socketRef.current && isConnected) {
        socketRef.current.send(data)
        return true
      } else {
        console.error("Cannot send message: WebSocket is not connected")
        return false
      }
    },
    [isConnected],
  )

  const reconnect = useCallback(() => {
    if (!isConnected && enabled) {
      reconnectCountRef.current = 0
      connect()
      return true
    }
    return false
  }, [connect, isConnected, enabled])

  return {
    isConnected,
    error,
    sendMessage,
    reconnect,
  }
}
