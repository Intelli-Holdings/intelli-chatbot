import React from 'react';
import { MessageSquare, Users, CalendarCheck, Activity, LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface DashboardMetricProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

const DashboardMetric: React.FC<DashboardMetricProps> = ({ title, value, change, icon: Icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function StatsOverview() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DashboardMetric
        title="Total Conversations"
        value="600"
        change="+20.1% from last month"
        icon={MessageSquare}
      />
      <DashboardMetric
        title="Total Leads"
        value="35"
        change="+180.1% from last month"
        icon={Users}
      />
      <DashboardMetric
        title="Total Reservations"
        value="12"
        change="+19% from last month"
        icon={CalendarCheck}
      />
      <DashboardMetric
        title="Active Conversations"
        value="19"
        change="On all platforms"
        icon={Activity}
      />
    </div>
  );
}
