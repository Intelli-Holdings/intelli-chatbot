"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"

const FacebookMessenger = () => {
  const organizationId = useActiveOrganizationId()

  const handleConnect = () => {
    if (!organizationId) return
    const url = new URL("/api/auth/facebook", window.location.origin)
    url.searchParams.set("organization_id", organizationId)
    url.searchParams.set("channel", "facebook")
    window.location.assign(url.toString())
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Messenger</CardTitle>
          <CardDescription>Connect your Facebook Page to start receiving messages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4" />
            <div>
              Ensure your Page has messaging enabled and you have admin access before connecting.
            </div>
          </div>

          <Button onClick={handleConnect} disabled={!organizationId} className="w-full">
            Connect Facebook Messenger
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default FacebookMessenger
