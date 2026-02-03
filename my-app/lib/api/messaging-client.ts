type MessagingClientConfig = {
  baseUrl: string
  accessToken: string
  apiVersion: string
}

export type MessagingPayload = {
  recipient: { id: string }
  message: { text: string }
}

export class MessagingClient {
  private baseUrl: string
  private accessToken: string
  private apiVersion: string

  constructor({ baseUrl, accessToken, apiVersion }: MessagingClientConfig) {
    this.baseUrl = baseUrl
    this.accessToken = accessToken
    this.apiVersion = apiVersion
  }

  async sendMessage(payload: MessagingPayload) {
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/me/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      const message = data?.error?.message || "Failed to send message"
      throw new Error(message)
    }

    return data
  }
}
