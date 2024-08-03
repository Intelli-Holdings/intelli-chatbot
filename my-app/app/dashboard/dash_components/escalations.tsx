import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EscalationItemProps {
  name: string;
  subtitle: string;
  status: string;
}

const EscalationItem: React.FC<EscalationItemProps> = ({ name, subtitle, status }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <Badge variant="secondary">{status}</Badge>
  </div>
);

export function Escalations() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Escalations - WhatsApp</CardTitle>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">You have 2 pending conversations</p>
        <div className="space-y-4">
          <EscalationItem name="Martin Koji" subtitle="Sent an Image" status="Neutral" />
          <EscalationItem name="0567987221" subtitle="Flight details" status="Excited" />
          <EscalationItem name="Kofi Bataman" subtitle="Payment" status="Money" />
          <EscalationItem name="Nana Yaa" subtitle="Further Info" status="Worried" />
          <EscalationItem name="050348567" subtitle="Payment" status="Money" />
        </div>
      </CardContent>
    </Card>
  );
}
