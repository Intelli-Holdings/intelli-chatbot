'use client'

import React, { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface Assistant {
  id: string
  name: string
  description: string
}

export default function Assistants() {

  const [assistants, setAssistants] = useState<Assistant[]>([])

  return (
    <div className="space-y-4">
      {assistants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((assistant) => (
            <Card key={assistant.id}>
              <CardHeader>
                <CardTitle>{assistant.name}</CardTitle>
                <CardDescription>{assistant.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-2">No assistants</CardTitle>
            <CardDescription className="mt-1">
              Get started by creating a new assistant.
            </CardDescription>
            <div className="mt-6">
              <Link href="/dashboard/channels" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create assistant
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
