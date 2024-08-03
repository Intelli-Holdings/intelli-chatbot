import React  from 'react';
import Notifications from "@/components/notifications";
import { Card } from "@/components/ui/card";

export default function NotificationPage() {

  return (
    <div className="container mx-auto p-4">   
      <Card>
        <Notifications />
      </Card>
    </div>
  );
}