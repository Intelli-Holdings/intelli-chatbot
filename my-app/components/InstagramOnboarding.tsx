"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MetaChannelOnboarding from "@/components/MetaChannelOnboarding"

type LoginOption = "instagram-login" | "facebook-login"

const InstagramOnboarding = () => {
  const [loginOption, setLoginOption] = useState<LoginOption>("instagram-login")

  // Handle Instagram OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const instagramCode = params.get("instagram_code")
    const instagramAuth = params.get("instagram_auth")

    if (instagramCode && instagramAuth === "success") {
      // User returned from Instagram OAuth, set to Instagram login option
      setLoginOption("instagram-login")
    }
  }, [])

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
              <MetaChannelOnboarding channel="instagram" authMethod="instagram" />
            ) : (
              <MetaChannelOnboarding channel="instagram" authMethod="facebook" />
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
                    <strong>Instagram Business or Creator Account</strong> (no Facebook Page required).
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
