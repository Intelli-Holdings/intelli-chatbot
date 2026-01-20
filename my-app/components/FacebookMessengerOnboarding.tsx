"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MetaChannelOnboarding from "@/components/MetaChannelOnboarding"

const FacebookMessengerOnboarding = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <Card className="md:w-1/2 shadow-md p-6 rounded-lg">
        <MetaChannelOnboarding channel="facebook" />
      </Card>

      <div className="md:w-1/2 flex flex-col gap-4">
        <Card className="bg-white shadow-md p-6 rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Onboarding Requirements</CardTitle>
            <CardDescription className="text-gray-600">
              Essentials before connecting Facebook Messenger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <p className="text-sm text-gray-700">
                <strong>Facebook Page Admin Access</strong> with messaging enabled.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <p className="text-sm text-gray-700">
                <strong>Business Manager Access</strong> to approve requested permissions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <p className="text-sm text-gray-700">
                <strong>Page Messaging Policies</strong> compliant with Meta guidelines.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FacebookMessengerOnboarding
