"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useWebsiteWidgets } from "@/hooks/use-website-widgets";
import { useWebsiteVisitors } from "@/hooks/use-website-visitors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface WebsiteWidgetCardProps {
    orgId: string | null;
    apiBaseUrl?: string;
  }

export const WebsiteWidgetCard: React.FC<WebsiteWidgetCardProps> = ({ orgId, apiBaseUrl = API_BASE_URL }) => {
    const [selectedWidgetKey, setSelectedWidgetKey] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState(false);

    const { widgets } = useWebsiteWidgets(orgId || undefined, apiBaseUrl);
    const { visitors } = useWebsiteVisitors(selectedWidgetKey);

    useEffect(() => {
        if (!selectedWidgetKey && widgets.length > 0) {
            setSelectedWidgetKey(widgets[0].widget_key);
        }
    }, [widgets, selectedWidgetKey]);

    const selectedWidget = useMemo(
        () => widgets.find((widget) => widget.widget_key === selectedWidgetKey) || null,
        [widgets, selectedWidgetKey],
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className="relative"
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                         <Link href="/dashboard/conversations/website">
                         <Card className="hover:bg-accent transition-colors duration-200 cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Website Widget Conversations
                                </CardTitle>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-md">
                                    <Globe className="h-4 w-4 text-muted-foreground" />                                    
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{visitors.reduce((total, v) => total + (v.messages?.length || 0), 0)}{" "} messages
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    From {visitors.length} visitors | {widgets.length} widgets available
                                </p>
                            </CardContent>
                        </Card>
                         </Link>
                        
                        {showDropdown && (
                            <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="absolute top-full left-0 w-full bg-white shadow-md rounded-md z-20">
                            {Array.isArray(widgets) && widgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className={`p-2 text-sm hover:bg-gray-100 cursor-pointer ${
                                        selectedWidget?.id === widget.id ? "font-bold" : ""
                                    }`}
                                    onClick={() => setSelectedWidgetKey(widget.widget_key)}
                                >
                                    {widget.widget_name}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hover to see widgets; Click card to visit conversations</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default WebsiteWidgetCard;
