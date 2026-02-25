import { NextResponse } from "next/server"
import { verifyMetaSignature } from "@/lib/api/webhook"
import type { MetaWebhookPayload } from "@/types/messenger"
import { logger } from "@/lib/logger";

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

  logger.info("Instagram webhook verification attempt", {
    mode,
    tokenMatch: token === verifyToken,
    hasChallenge: !!challenge,
  })

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    logger.info("Instagram webhook verification successful")
    return new Response(challenge ?? "", { status: 200 })
  }

  logger.error("Instagram webhook verification failed")
  return new Response("Webhook verification failed", { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signatureHeader =
    request.headers.get("x-hub-signature-256") || request.headers.get("x-hub-signature")
  const appSecret = process.env[APP_SECRET_ENV] || process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET

  if (!appSecret) {
    logger.error("Instagram webhook missing app secret")
    return NextResponse.json({ error: "Missing app secret" }, { status: 500 })
  }

  // Verify webhook signature
  const { isValid } = verifyMetaSignature(rawBody, signatureHeader, appSecret)
  if (!isValid) {
    logger.error("Instagram webhook invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch (error) {
    logger.error("Instagram webhook invalid payload", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  logger.info("Instagram webhook received event", {
    object: payload.object,
    entries: payload.entry?.length,
  })

  // Process webhook events
  payload.entry?.forEach((entry) => {
    // Handle messaging events
    entry.messaging?.forEach((event) => {
      if (event.message) {
        logger.info("Instagram webhook incoming message", {
          sender: event.sender?.id,
          recipient: event.recipient?.id,
          text: event.message.text,
          timestamp: event.timestamp,
        })
        // TODO: Forward to your backend message processing system
      }

      if (event.postback) {
        logger.info("Instagram webhook postback", {
          sender: event.sender?.id,
          payload: event.postback.payload,
          title: event.postback.title,
          timestamp: event.timestamp,
        })
        // TODO: Handle postback events
      }

      if (event.read) {
        logger.debug("Instagram webhook message read", {
          sender: event.sender?.id,
          timestamp: event.timestamp,
        })
      }

      if (event.delivery) {
        logger.debug("Instagram webhook message delivered", {
          recipient: event.recipient?.id,
          timestamp: event.timestamp,
        })
      }
    })

    // Handle changes (like story mentions, comments, etc.)
    entry.changes?.forEach((change) => {
      logger.info("Instagram webhook change event", {
        field: change.field,
        value: change.value,
      })
    })
  })

  return NextResponse.json({ status: "ok" })
}
