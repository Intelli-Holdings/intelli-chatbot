"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { WebSocketMessage } from "@/hooks/use-websocket"

interface WebSocketHandlerProps {
  customerNumber?: string
  phoneNumber?: string
  websocketUrl?: string
}

export function WebSocketHandler({ customerNumber, phoneNumber, websocketUrl }: WebSocketHandlerProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // If props are provided, start connection immediately
    if (customerNumber && phoneNumber && websocketUrl) {
      startWebSocketConnection(customerNumber, phoneNumber, websocketUrl)
      setIsActive(true)
    } else if (customerNumber && phoneNumber) {
      startWebSocketConnection(customerNumber, phoneNumber)
      setIsActive(true)
    }

    // Listen for websocket control events
    const handleWebSocketControl = (event: CustomEvent) => {
      const { action, customerNumber, phoneNumber } = event.detail

      if (action === "start" && customerNumber && phoneNumber) {
        startWebSocketConnection(customerNumber, phoneNumber)
        setIsActive(true)
      } else if (action === "stop") {
        // Don't actually stop the connection - we want to keep listening
        // Just update UI state if needed
        setIsActive(false)
      }
    }

    // Listen for AI support changes
    const handleAiSupportChange = (event: CustomEvent) => {
      const { isAiSupport, customerNumber, phoneNumber } = event.detail
      
      // Always keep connection active, just update the UI state
      if (!isAiSupport && customerNumber && phoneNumber) {
        setIsActive(true)
      } else {
        setIsActive(false)
      }
    }

    window.addEventListener("websocketControl", handleWebSocketControl as EventListener)
    window.addEventListener("aiSupportChanged", handleAiSupportChange as EventListener)

    return () => {
      window.removeEventListener("websocketControl", handleWebSocketControl as EventListener)
      window.removeEventListener("aiSupportChanged", handleAiSupportChange as EventListener)
    }
  }, [customerNumber, phoneNumber, websocketUrl])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebSocketConnection()
    }
  }, [])

  const startWebSocketConnection = (customerNumber: string, phoneNumber: string, url?: string) => {
    // Close existing connection if any
    stopWebSocketConnection()

    const WEBSOCKET_URL =
      url ||
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://dev-intelliconcierge.onrender.com/ws/"}/messages/?customer_number=${customerNumber}&phone_number=${phoneNumber}`

    console.log("Connecting to WebSocket for human support:", WEBSOCKET_URL)

    const ws = new WebSocket(WEBSOCKET_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connection established for human support.")
      toast.success("Connected to conversation")

      // Dispatch connection status event
      window.dispatchEvent(
        new CustomEvent("websocketConnectionChange", {
          detail: { status: "connected" },
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)

        // Generate a unique id for the message
        const newId = Date.now()

        // Extract media URL if applicable
        let mediaUrl = null
        if (message.type === "image" || message.type === "audio" || message.type === "video") {
          const mediaMatch = message.content.match(/Media - (https:\/\/[^\s]+)/)
          if (mediaMatch && mediaMatch[1]) {
            mediaUrl = mediaMatch[1]
          }
        }

        // Use the timestamp from the payload if available; otherwise fallback to current time
        const messageTimestamp = message.timestamp || new Date().toISOString()

        // Create the new message object
        const newMessage = {
          id: newId,
          content: message.type === "text" ? message.content : null,
          sender: message.sender,
          created_at: messageTimestamp,
          read: false,
          answer: null,
          media: mediaUrl,
          type: message.type,
        }

        // Dispatch a custom event to update the chat area with the new message
        window.dispatchEvent(
          new CustomEvent("newMessageReceived", {
            detail: { message: newMessage },
          }),
        )
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed for human support.")
      toast.info("Disconnected from conversation")

      // Dispatch connection status event
      window.dispatchEvent(
        new CustomEvent("websocketConnectionChange", {
          detail: { status: "disconnected" },
        }),
      )
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      toast.error("WebSocket connection error")
    }
  }

  const stopWebSocketConnection = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  // This component doesn't render anything visible
  return null
}

