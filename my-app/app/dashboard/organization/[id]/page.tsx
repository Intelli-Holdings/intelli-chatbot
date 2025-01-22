"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersTable } from "./components/members-table"
import { DeleteOrgDialog } from "./components/delete-org-dialog"
import { InviteModal } from "../components/invite-modal"

export default function OrganizationDetails({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("joined")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  // Use the params.id to fetch specific organization
  const { organization, membership, isLoaded } = useOrganization()

  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  // Find the correct organization from the list
  const currentOrg = userMemberships?.data?.find(
    (mem) => mem.organization.id === params.id
  )

    const isAdmin = membership?.role === "org:admin"

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto"></div>
            <p>Loading organization details...</p>
          </div>
        </div>
      )
    }
  
    if (!organization || !currentOrg) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">Organization not found</p>
            <Link
              href="/dashboard/organization"
              className="text-primary hover:underline"
            >
              Back to Organizations
            </Link>
          </div>
        </div>
      )
    }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-start justify-between">
        
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/organization"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Organizations
          </Link>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10">
              {currentOrg.organization.imageUrl ? (
                <Image
                  width={120}
                  height={120}
                  src={currentOrg.organization.imageUrl}
                  alt={currentOrg.organization.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-primary/10" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{currentOrg.organization.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentOrg.organization.membersCount || 1} member{currentOrg.organization.membersCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
         
          
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search members..."
                className="w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by: Joined" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joined">Sort by: Joined</SelectItem>
                  <SelectItem value="name">Sort by: Name</SelectItem>
                  <SelectItem value="role">Sort by: Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
              className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white" 
              size={"sm"}
              variant="outline">
                Actions
                <MoreVertical className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>Add member</DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete organization
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          </div>

          <MembersTable searchQuery={searchQuery} sortBy={sortBy}  organizationId={params.id}  />
        </TabsContent>
      </Tabs>

      <DeleteOrgDialog
        open={showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(false)}
        organizationId={params.id}
      />

      <InviteModal
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        organizationId={params.id}
      />
    </div>
  )
}

