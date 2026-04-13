import { NextResponse } from "next/server"
import { verifyMetaSignature } from "@/lib/api/webhook"
import type { MetaWebhookPayload } from "@/types/messenger"
import { logger } from "@/lib/logger";

const APP_SECRET_ENV = "FACEBOOK_APP_SECRET"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 })
  }

  return new Response("Webhook verification failed", { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signatureHeader =
    request.headers.get("x-hub-signature-256") || request.headers.get("x-hub-signature")
  const appSecret = process.env[APP_SECRET_ENV] || process.env.FACEBOOK_APP_SECRET

  if (!appSecret) {
    return NextResponse.json({ error: "Missing app secret" }, { status: 500 })
  }

  const { isValid } = verifyMetaSignature(rawBody, signatureHeader, appSecret)
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const channel = payload.object === "instagram" ? "instagram" : "facebook"

  payload.entry?.forEach((entry) => {
    entry.messaging?.forEach((event) => {
      if (event.message) {
        logger.info("[Meta webhook] message received", {
          channel,
          sender: event.sender?.id,
          text: event.message.text,
          timestamp: event.timestamp,
        })
      }

      if (event.postback) {
        logger.info("[Meta webhook] postback received", {
          channel,
          sender: event.sender?.id,
          payload: event.postback.payload,
          title: event.postback.title,
          timestamp: event.timestamp,
        })
      }
    })
  })

  return NextResponse.json({ status: "ok" })
}
