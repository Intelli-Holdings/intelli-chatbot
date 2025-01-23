import React from 'react';
import { Metadata } from 'next';
import EscalationEvents from '@/components/EscalationEvents';

export const metadata: Metadata = {
  title: 'Escalation Events | Dashboard',
  description: 'Manage your Escalation events',
};

export default function EscalationEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Escalation Events</h1>
        <p className="text-muted-foreground">Create and manage escalation events for your business</p>

       
       <main className="flex flex-1 flex-col">
      <EscalationEvents />
      </main>
    </div>
  );
}
