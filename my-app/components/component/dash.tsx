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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashComponent() {
  return (
    <div className="p-1 space-y-6">

      

      <StatsOverview />

      {/**
       * 
       * <div className="flex justify-between items-center">
        <Link href={"/dashboard/get-started"} onClick={() => {}}>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" className="mr-2 bg-blue-600">
                    Get Started
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This walks you through a 5-step guide to get you all set up
                    after signing up
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Link>
      </div>
       * 
   * <div className="grid gap-6 md:grid-cols-2">
      <OverviewChart />
      <Escalations />
      </div> 
   * 
   */}
    </div>
  );
}
