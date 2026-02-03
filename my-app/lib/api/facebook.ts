import { MessagingClient } from "@/lib/api/messaging-client"

const DEFAULT_API_VERSION = "v21.0"

export const createFacebookClient = (accessToken: string, apiVersion = DEFAULT_API_VERSION) => {
  return new MessagingClient({
    baseUrl: "https://graph.facebook.com",
    accessToken,
    apiVersion,
  })
}
