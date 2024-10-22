import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Users,
  CalendarCheck,
  Activity,
  Filter,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChartIcon,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "@/components/dash-components/overview";
import { Escalations } from "@/components/dash-components/escalations";
import { StatsOverview } from "@/components/dash-components/stats";

// Onborda
import { useOnborda, } from "onborda";
import Steps from "@/components/component/Code/Steps";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Dashboard from "../dashboard/main";

export function DashComponent() {
  const { startOnborda } = useOnborda();
  const handleStartOnborda = () => {
    startOnborda("onboardingtour");
  };



  return (
    <div className="space-y-8">
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" className="mr-2 bg-[#007fff] rounded-xl" onClick={handleStartOnborda}>
                <Sparkles size={16} className="mr-2" /> Start Tour
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This gives you a product tour of Intelli</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dashboard />

      {/**
   * <div className="grid gap-6 md:grid-cols-2">
      <OverviewChart />
      <Escalations />
      </div> 
   * 
   */}
    </div>
  );
}
