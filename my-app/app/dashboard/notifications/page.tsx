import React  from 'react';
import Notifications from "@/components/notifications";


export default function NotificationPage() {

  return (
    <div className="container mx-auto px-4 py-8">   
       <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Notifications</h1>
      <Notifications />
    </div>
  );
}