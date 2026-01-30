import { MessagingClient } from "@/lib/api/messaging-client"

const DEFAULT_API_VERSION = "v21.0"

export const createInstagramClient = (accessToken: string, apiVersion = DEFAULT_API_VERSION) => {
  return new MessagingClient({
    baseUrl: "https://graph.instagram.com",
    accessToken,
    apiVersion,
  })
}
