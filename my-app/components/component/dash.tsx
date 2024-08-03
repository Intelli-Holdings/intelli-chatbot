import React, { useState } from 'react';
import { MessageSquare, Users, CalendarCheck, Activity, Filter, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OverviewChart } from '@/components/dash-components/overview';
import { Escalations } from '@/components/dash-components/escalations';
import { StatsOverview } from '@/components/dash-components/stats';

export function DashComponent() {

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <Button variant="ghost" className="mr-2">Overview</Button>
          <Button variant="outline">Channels</Button>
        </div>
      </div>

      <StatsOverview />

      <div className="grid gap-6 md:grid-cols-2">
      <OverviewChart />
      <Escalations />
      </div>
    </div>
  );
}