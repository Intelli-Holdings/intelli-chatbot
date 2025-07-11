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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Notifications</h1>
      
      </div>

      {isLoadingMembers ? <NotificationsSkeleton /> : <Notifications members={members} />}
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
