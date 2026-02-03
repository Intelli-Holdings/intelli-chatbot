"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

const InstagramMessenger = () => {
  const handleConnect = () => {
    const loginUrl = process.env.NEXT_PUBLIC_INSTAGRAM_LOGIN_URL
    if (loginUrl) {
      window.location.assign(loginUrl)
      return
    }

    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
    if (!clientId || !redirectUri) return

    const url = new URL("https://www.instagram.com/oauth/authorize")
    const scopes =
      process.env.NEXT_PUBLIC_INSTAGRAM_SCOPES ||
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights"

    url.searchParams.set("force_reauth", "true")
    url.searchParams.set("client_id", clientId)
    url.searchParams.set("redirect_uri", redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", scopes)
    window.location.assign(url.toString())
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instagram Messaging</CardTitle>
          <CardDescription>Connect your Instagram Professional account to reply to DMs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-pink-100 bg-pink-50 p-4 text-sm text-pink-700">
            <Info className="mt-0.5 h-4 w-4" />
            <div>
              Your Instagram account must be a Professional account linked to a Facebook Page.
            </div>
          </div>

          <Button onClick={handleConnect} className="w-full">
            Connect Instagram
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default InstagramMessenger
