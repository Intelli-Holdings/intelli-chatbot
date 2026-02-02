import { NextResponse } from "next/server"
import { verifyMetaSignature } from "@/lib/api/webhook"
import type { MetaWebhookPayload } from "@/types/messenger"

const APP_SECRET_ENV = "INSTAGRAM_APP_SECRET"

/**
 * Instagram Webhook Handler
 * Handles webhook verification and incoming Instagram messages
 *
 * Webhook URL: https://your-domain.com/api/webhooks/instagram
 * Verify Token: Set in META_WEBHOOK_VERIFY_TOKEN environment variable
 * App Secret: Set in INSTAGRAM_APP_SECRET or NEXT_PUBLIC_INSTAGRAM_APP_SECRET
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

  console.log("[Instagram webhook] Verification attempt:", {
    mode,
    tokenMatch: token === verifyToken,
    hasChallenge: !!challenge,
  })

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    console.log("[Instagram webhook] Verification successful")
    return new Response(challenge ?? "", { status: 200 })
  }

  console.error("[Instagram webhook] Verification failed")
  return new Response("Webhook verification failed", { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signatureHeader =
    request.headers.get("x-hub-signature-256") || request.headers.get("x-hub-signature")
  const appSecret = process.env[APP_SECRET_ENV] || process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET

  if (!appSecret) {
    console.error("[Instagram webhook] Missing app secret")
    return NextResponse.json({ error: "Missing app secret" }, { status: 500 })
  }

  // Verify webhook signature
  const { isValid } = verifyMetaSignature(rawBody, signatureHeader, appSecret)
  if (!isValid) {
    console.error("[Instagram webhook] Invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch (error) {
    console.error("[Instagram webhook] Invalid payload:", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  console.log("[Instagram webhook] Received event:", {
    object: payload.object,
    entries: payload.entry?.length,
  })

  // Process webhook events
  payload.entry?.forEach((entry) => {
    // Handle messaging events
    entry.messaging?.forEach((event) => {
      if (event.message) {
        console.log("[Instagram webhook] Incoming message:", {
          sender: event.sender?.id,
          recipient: event.recipient?.id,
          text: event.message.text,
          timestamp: event.timestamp,
        })
        // TODO: Forward to your backend message processing system
      }

      if (event.postback) {
        console.log("[Instagram webhook] Postback:", {
          sender: event.sender?.id,
          payload: event.postback.payload,
          title: event.postback.title,
          timestamp: event.timestamp,
        })
        // TODO: Handle postback events
      }

      if (event.read) {
        console.log("[Instagram webhook] Message read:", {
          sender: event.sender?.id,
          timestamp: event.timestamp,
        })
      }

      if (event.delivery) {
        console.log("[Instagram webhook] Message delivered:", {
          recipient: event.recipient?.id,
          timestamp: event.timestamp,
        })
      }
    })

    // Handle changes (like story mentions, comments, etc.)
    entry.changes?.forEach((change) => {
      console.log("[Instagram webhook] Change event:", {
        field: change.field,
        value: change.value,
      })
    })
  })

  return NextResponse.json({ status: "ok" })
}
