"use client"

import { useOrganization } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

interface MembersTableProps {
  searchQuery: string
  sortBy: string
  organizationId: string;
}

export function MembersTable({ searchQuery, sortBy }: MembersTableProps) {
  const { organization, membership } = useOrganization()
  const isAdmin = membership?.role === "org:admin"
  const [loading, setLoading] = React.useState(true)
  const [members, setMembers] = React.useState<any[]>([])

  React.useEffect(() => {
    if (organization) {
      const fetchMembers = async () => {
        try {
          const membersList = await organization.getMemberships()
          setMembers(membersList.data)
        } catch (error) {
          console.error("Failed to fetch members:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchMembers()
    }
  }, [organization])

  const filteredMembers = members
    .filter((member) => {
      const searchString = searchQuery.toLowerCase()
      const fullName = `${member.publicUserData?.firstName} ${member.publicUserData?.lastName}`.toLowerCase()
      const email = member.publicUserData?.identifier?.toLowerCase()

      return fullName.includes(searchString) || email?.includes(searchString)
    })
    .sort((a: { publicUserData: { firstName: any; lastName: any }; role: string; createdAt: string | number | Date }, b: { publicUserData: { firstName: any; lastName: any }; role: any; createdAt: string | number | Date }) => {
      switch (sortBy) {
        case "name":
          return `${a.publicUserData?.firstName} ${a.publicUserData?.lastName}`.localeCompare(
            `${b.publicUserData?.firstName} ${b.publicUserData?.lastName}`,
          )
        case "role":
          return a.role.localeCompare(b.role)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const member = members.find((m: { id: string }) => m.id === memberId)
      if (member) {
        await member.update({ role: newRole })
      }
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-300 shadow-sm">
    <Table className="min-w-full bg-white">
      <TableHeader>
        <TableRow className="bg-gray-50 border-b">
          <TableHead className="py-2 px-4 text-left font-medium text-gray-600">User</TableHead>
          <TableHead className="py-2 px-4 text-left font-medium text-gray-600">Joined</TableHead>
          <TableHead className="py-2 px-4 text-left font-medium text-gray-600">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMembers.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.publicUserData?.imageUrl} />
                  <AvatarFallback>
                    {member.publicUserData?.firstName?.[0]}
                    {member.publicUserData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">{member.publicUserData?.identifier}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {isAdmin ? (
                <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org:admin">Admin</SelectItem>
                    <SelectItem value="org:member">Member</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm">{member.role === "org:admin" ? "Admin" : "Member"}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}

