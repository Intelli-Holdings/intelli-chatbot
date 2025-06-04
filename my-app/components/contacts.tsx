'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Contact } from '@/types/contact'
import { Conversation } from '@/app/dashboard/conversations/components/types'
import { format } from 'date-fns'
import { ContactSkeleton } from '@/components/contact-skeleton'

interface ContactsProps {
  conversations?: Conversation[];
  phoneNumber: string;
  searchTerm?: string;
}

export function Contacts({ conversations = [], phoneNumber, searchTerm = '' }: ContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    // Convert conversations to contacts
    const whatsappContacts = conversations.map((conversation): Contact => ({
      id: conversation.id.toString(),
      name: conversation.customer_name || 'Unknown',
      email: '',
      phone: conversation.customer_number || conversation.recipient_id || '',
      title: '',
      company: '',
      dateAdded: conversation.updated_at,
      source: 'WhatsApp',
      hasMessaged: true,
      lastActive: conversation.updated_at,
      avatar: `https://avatar.vercel.sh/${conversation.customer_name || conversation.customer_number}.png`
    }))

    setContacts(whatsappContacts)
    setIsLoading(false)
  }, [conversations])

  useEffect(() => {
    // Filter contacts based on search term
    const filtered = contacts.filter(contact => {
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.phone.toLowerCase().includes(searchLower) ||
        contact.company.toLowerCase().includes(searchLower) ||
        contact.title.toLowerCase().includes(searchLower)
      );
    });
    setFilteredContacts(filtered);
  }, [contacts, searchTerm]);

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-300 shadow-sm">
      <Table className="min-w-full bg-white-100">
        <TableHeader>
          <TableRow className='bg-blue-50 border-b'>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ContactSkeleton key={index} />
            ))
          ) : (
            filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Added {format(new Date(contact.dateAdded), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contact.email || '-'}</TableCell>
                <TableCell>+{contact.phone || '-'}</TableCell>
                <TableCell>{contact.title || '-'}</TableCell>
                <TableCell>{contact.company || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={contact.source === 'WhatsApp' ? 'default' : 'secondary'}>
                      {contact.source}
                    </Badge>
                    {contact.hasMessaged && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Messaged
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.lastActive ? format(new Date(contact.lastActive), 'MMM d, h:mm a') : '-'}
                </TableCell>
                <TableCell>
                  
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}