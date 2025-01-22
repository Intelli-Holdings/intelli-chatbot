"use client"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { organization } = useOrganization()

  const handleInvite = async () => {
    try {
      setIsLoading(true)
      await organization?.inviteMember({ emailAddress: email, role: "admin" })
      toast.success("Invitation sent successfully")
      setEmail("")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to send invitation")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Invite a new member to join your organization</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email || isLoading}>
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

