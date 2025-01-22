"use client"

import { useRouter } from "next/navigation"
import { useOrganization, OrganizationList } from "@clerk/nextjs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
}

export function DeleteOrgDialog({ open, onOpenChange }: DeleteOrgDialogProps) {
  const router = useRouter()
  const { organization } = useOrganization()

  const handleDelete = async () => {
    try {
      await organization?.destroy()
      router.push("/dashboard/organization")
    } catch (error) {
      console.error("Failed to delete organization:", error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the organization and remove all members.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

