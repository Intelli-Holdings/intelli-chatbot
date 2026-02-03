"use client"

import { useState } from "react"
import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
}

export function InviteModal({ isOpen, onClose, organizationId }: InviteModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"org:admin" | "org:member">("org:member")
  const [isLoading, setIsLoading] = useState(false)
    // Use organizationList to find current org
    const { userMemberships } = useOrganizationList({
      userMemberships: {
        infinite: true,
      },
    })
  
    const currentOrg = userMemberships?.data?.find(
      (mem) => mem.organization.id === organizationId
    )?.organization

  const handleInvite = async () => {
    if (!email || !currentOrg) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await currentOrg.inviteMember({ 
        emailAddress: email,
        role: role
      })
      
      toast.success("Invitation sent successfully")
      setEmail("")
      setRole("org:member")
      onClose()
    } catch (error) {
      console.error("Invite error:", error)
      toast.error("Failed to send invitation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join {currentOrg?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "org:admin" | "org:member")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org:admin">Admin</SelectItem>
                <SelectItem value="org:member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleInvite}
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending invite...
              </>
            ) : (
              'Send Invite'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}