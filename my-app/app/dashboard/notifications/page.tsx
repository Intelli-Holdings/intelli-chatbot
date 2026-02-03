"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import type { TeamMember, ClerkMember } from "@/types/notification"
import Notifications from "@/app/dashboard/notifications/Notifications"
import { memberUtils } from "@/utils/members"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotificationContext } from "@/hooks/use-notification-context"

const NotificationPage: React.FC = () => {
  const { organization } = useOrganization()
  const { userMemberships } = useOrganizationList({ userMemberships: { infinite: true } })
  const { notifications, isConnected } = useNotificationContext()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        setIsLoadingMembers(true)
        try {
          const membersList = await organization.getMemberships()
          const transformedMembers = membersList.data.map((member: ClerkMember) => memberUtils.transform(member))
          setMembers(transformedMembers)
        } catch (error) {
          console.error("Failed to fetch members:", error)
        } finally {
          setIsLoadingMembers(false)
        }
      }
    }
    loadMembers()
  }, [organization])

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {isLoadingMembers ? <NotificationsSkeleton /> : <Notifications members={members} />}
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64 rounded-full" />
      </div>
      <div className="w-full rounded-lg border border-[#e9edef] bg-white shadow-sm">
        <div className="border-b border-[#e9edef] p-3 bg-[#f0f2f5]">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="divide-y divide-[#e9edef]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
