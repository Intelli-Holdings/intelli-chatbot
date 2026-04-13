"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InstagramEmbeddedSignup from "@/components/InstagramEmbeddedSignup"

const InstagramOnboarding = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <InstagramEmbeddedSignup />
        </div>

        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Onboarding Requirements</CardTitle>
            <CardDescription className="text-gray-600">
              Essentials before connecting Instagram Messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold">1.</span>
              <p className="text-sm text-gray-700">
                <strong>Instagram Professional Account</strong> (Business or Creator) for direct messaging.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold">2.</span>
              <p className="text-sm text-gray-700">
                <strong>Business Messaging Enabled</strong> in your Instagram account settings.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold">3.</span>
              <p className="text-sm text-gray-700">
                <strong>Grant Permissions</strong> for messaging access during the signup process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InstagramOnboarding
