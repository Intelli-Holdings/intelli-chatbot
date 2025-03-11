'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Import, Search } from 'lucide-react'
import { ImportContacts } from "./import-contacts"
import { CRMIntegration } from "./crm-integration"

interface ContactsHeaderProps {
  onSearchChange: (search: string) => void;
}

export function ContactsHeader({ onSearchChange }: ContactsHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-4 flex-1">

        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Type to search your contacts..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white"
                size={"sm"}
                variant="outline">
              <Import className="mr-2 h-4 w-4" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Import Contacts</DialogTitle>
              <DialogDescription>
                Import contacts from a file or connect to your CRM.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Import File</TabsTrigger>
                <TabsTrigger value="crm">Connect CRM</TabsTrigger>
              </TabsList>
              <TabsContent value="file">
                <ImportContacts />
              </TabsContent>
              <TabsContent value="crm">
                <CRMIntegration />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}