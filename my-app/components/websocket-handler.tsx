"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { WebSocketMessage } from "@/hooks/use-websocket"
import { useAuth } from "@clerk/nextjs"

import { logger } from "@/lib/logger";
interface WebSocketHandlerProps {
  customerNumber?: string
  phoneNumber?: string
  websocketUrl?: string
}

export function WebSocketHandler({ customerNumber, phoneNumber, websocketUrl }: WebSocketHandlerProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isActive, setIsActive] = useState(false)
  const { getToken } = useAuth()

  const stopWebSocketConnection = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const startWebSocketConnection = useCallback(async (customerNumber: string, phoneNumber: string, url?: string) => {
    // Close existing connection if any
    stopWebSocketConnection()

    let wsUrl =
      url ||
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://dev-intelliconcierge.onrender.com/ws"}/messages/?customer_number=${customerNumber}&phone_number=${phoneNumber}`

    try {
      const token = await getToken()
      if (token && !wsUrl.includes("token=")) {
        const separator = wsUrl.includes("?") ? "&" : "?"
        wsUrl = `${wsUrl}${separator}token=${encodeURIComponent(token)}`
      }
    } catch (error) {
      logger.error("Failed to get auth token for WebSocket:", { error: error instanceof Error ? error.message : String(error) })
    }

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {     

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

        // Handle status updates separately
        if (message.type === "status_update") {
          // Dispatch status update event
          window.dispatchEvent(
            new CustomEvent("messageStatusUpdate", {
              detail: {
                message_id: message.message_id,
                status: message.status,
                timestamp: message.timestamp,
              },
            }),
          )
          return
        }

        // Generate a unique id for the message with additional randomness
        const newId = Date.now() + Math.floor(Math.random() * 10000)

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

        // Determine if this is a customer message or business/AI message
        const isCustomerMessage = message.sender === "customer"
        const messageContent = message.type === "text" ? message.content : null

        // Create the new message object
        // Customer messages go in 'content' field, Business/AI messages go in 'answer' field
        const newMessage = {
          id: newId,
          content: isCustomerMessage ? messageContent : null,
          answer: !isCustomerMessage ? messageContent : null,
          sender: message.sender,
          created_at: messageTimestamp,
          read: false,
          media: mediaUrl,
          type: message.type,
          whatsapp_message_id: message.message_id, // Include WhatsApp message ID for deduplication
        }

        // Dispatch a custom event to update the chat area with the new message
        window.dispatchEvent(
          new CustomEvent("newMessageReceived", {
            detail: { message: newMessage },
          }),
        )
      } catch (error) {

      }
    }

    ws.onclose = () => {    

      // Dispatch connection status event
      window.dispatchEvent(
        new CustomEvent("websocketConnectionChange", {
          detail: { status: "disconnected" },
        }),
      )
    }

    ws.onerror = (error) => {
      logger.error("WebSocket error:", { error: error instanceof Error ? error.message : String(error) })
     
    }
  }, [getToken, stopWebSocketConnection])

  useEffect(() => {
    // If props are provided, start connection immediately
    if (customerNumber && phoneNumber && websocketUrl) {
      void startWebSocketConnection(customerNumber, phoneNumber, websocketUrl)
      setIsActive(true)
    } else if (customerNumber && phoneNumber) {
      void startWebSocketConnection(customerNumber, phoneNumber)
      setIsActive(true)
    }

    // Listen for websocket control events
    const handleWebSocketControl = (event: CustomEvent) => {
      const { action, customerNumber, phoneNumber } = event.detail

      if (action === "start" && customerNumber && phoneNumber) {
        void startWebSocketConnection(customerNumber, phoneNumber)
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
  }, [customerNumber, phoneNumber, websocketUrl, startWebSocketConnection, stopWebSocketConnection])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebSocketConnection()
    }
  }, [stopWebSocketConnection])


  // This component doesn't render anything visible
  return null
}
