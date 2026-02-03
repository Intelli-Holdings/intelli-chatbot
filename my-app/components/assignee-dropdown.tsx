"use client"

import { useState, useRef, useEffect } from "react"
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserPlus2 } from "lucide-react"

interface User {
  id: string
  identifier: string
  imageUrl?: string
}

interface AssigneeDropdownProps {
  users: User[]
  onAssign: (userId: string) => void
  disabled?: boolean
}

export function AssigneeDropdown({ users, onAssign, disabled }: AssigneeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter((user) => user.identifier.toLowerCase().includes(searchQuery.toLowerCase()))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-pink-500"]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800" disabled={disabled}>
          <UserPlus2 className="h-4 w-4 mr-1" />
          <span>Assign</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search users..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-0"
          />
          <CommandList>
            {filteredUsers.length === 0 ? (
              <p className="p-2 text-sm text-gray-500">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    onAssign(user.id)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className={`${getAvatarColor(user.identifier)}`}>
                      {getInitials(user.identifier)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{user.identifier}</span>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

