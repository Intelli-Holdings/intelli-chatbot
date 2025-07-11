"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Assignee {
  id: string
  name: string
  initials: string
  online?: boolean
}

interface AssigneeSelectorProps {
  assignees: Assignee[]
  selectedAssignees: string[]
  onSelect: (assigneeId: string) => void
  onClose?: () => void
}

export function AssigneeSelector({ assignees, selectedAssignees, onSelect, onClose }: AssigneeSelectorProps) {
  const [search, setSearch] = React.useState("")

  return (
    <div className="w-[300px] border rounded-lg bg-background shadow-md">
      <div className="flex items-center justify-between p-2 border-b">
        <Badge variant="secondary" className="gap-10">
          <span>Assignees</span>
          {selectedAssignees.length > 0 && <span className="ml-1">{selectedAssignees.length}</span>}
        </Badge>
        {onClose && (
          <button onClick={onClose} className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Command className="border-0">
        <CommandInput placeholder="Search or enter email..." value={search} onValueChange={setSearch} />
        <ScrollArea className="h-[200px]">
          <CommandList>
            <CommandEmpty>No assignees found.</CommandEmpty>
            <CommandGroup>
              {assignees.map((assignee) => (
                <CommandItem
                  key={assignee.id}
                  value={assignee.name}
                  onSelect={() => onSelect(assignee.id)}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-sm">{assignee.initials}</AvatarFallback>
                    </Avatar>
                    {assignee.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <span>{assignee.name}</span>
                  {selectedAssignees.includes(assignee.id) && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  )
}

