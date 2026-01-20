"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MetaChannelOnboarding from "@/components/MetaChannelOnboarding"

type LoginOption = "instagram-login" | "facebook-login"

const InstagramOnboarding = () => {
  const [loginOption, setLoginOption] = useState<LoginOption>("instagram-login")

  const handleInstagramLogin = () => {
    const loginUrl = process.env.NEXT_PUBLIC_INSTAGRAM_LOGIN_URL
    if (loginUrl) {
      window.location.assign(loginUrl)
      return
    }

    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
    if (!clientId || !redirectUri) return

    const scopes =
      process.env.NEXT_PUBLIC_INSTAGRAM_SCOPES ||
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish"

    const url = new URL("https://www.instagram.com/oauth/authorize")
    url.searchParams.set("force_reauth", "true")
    url.searchParams.set("client_id", clientId)
    url.searchParams.set("redirect_uri", redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", scopes)

    window.location.assign(url.toString())
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={loginOption === "instagram-login" ? "default" : "outline"}
          onClick={() => setLoginOption("instagram-login")}
        >
          Instagram Login
        </Button>
        <Button
          type="button"
          variant={loginOption === "facebook-login" ? "default" : "outline"}
          onClick={() => setLoginOption("facebook-login")}
        >
          Facebook Login for Business
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="shadow-md rounded-lg">
          <CardContent className="p-6">
            {loginOption === "instagram-login" ? (
              <div className="space-y-4">
                <CardTitle>Instagram API with Instagram Login</CardTitle>
                <CardDescription>
                  For Instagram Business or Creator accounts without a Facebook Page link.
                </CardDescription>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Messaging, publishing, comments, and insights.</li>
                  <li>No Facebook Page required.</li>
                  <li>Limitations: cannot access ads or tagging.</li>
                </ul>
                <div className="rounded-lg border border-pink-100 bg-pink-50 p-3 text-xs text-pink-700">
                  Required permissions: instagram_business_basic, instagram_business_manage_messages,
                  instagram_business_manage_comments, instagram_business_content_publish.
                </div>
                <Button onClick={handleInstagramLogin} className="bg-[#d62976] hover:bg-[#c026d3]">
                  Continue with Instagram Login
                </Button>
              </div>
            ) : (
              <MetaChannelOnboarding channel="instagram" />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Onboarding Requirements</CardTitle>
            <CardDescription className="text-gray-600">
              Essentials before connecting Instagram Messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loginOption === "instagram-login" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">1.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Instagram Business or Creator Account</strong> (no Page required).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">2.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Messaging permissions</strong> enabled for your app.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">3.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Updated scopes</strong> (`instagram_business_*`) configured.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">1.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Instagram Professional Account</strong> linked to a Facebook Page.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">2.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Page Admin Access</strong> to grant Instagram permissions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold">3.</span>
                  <p className="text-sm text-gray-700">
                    <strong>Business Messaging Enabled</strong> for the Instagram account.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InstagramOnboarding
