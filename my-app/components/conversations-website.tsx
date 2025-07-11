"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Widget {
  id: number;
  widget_name: string;
  widget_key: string;
}

interface Visitor {
  id: number;
  visitor_id: string;
  messages: { id: number; content: string }[];
}

interface WebsiteWidgetCardProps {
    orgId: string | null;
    apiBaseUrl?: string;
  }

export const WebsiteWidgetCard: React.FC<WebsiteWidgetCardProps> = ({ orgId, apiBaseUrl = API_BASE_URL }) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!orgId) return;
        fetch(`${apiBaseUrl}/widgets/organization/${orgId}/all/`)
            .then((res) => res.json())
            .then((data: Widget[]) => {
                // Ensure data is array or default to empty array
                const widgetArray = Array.isArray(data) ? data : [];
                setWidgets(widgetArray);
                if (widgetArray.length > 0) {
                    setSelectedWidget(widgetArray[0]);
                }
            })
            .catch((error) => console.error("Error fetching widgets:", error));
    }, [orgId, apiBaseUrl]);

    useEffect(() => {
        if (!selectedWidget) return;
        fetch(`${apiBaseUrl}/widgets/widget/${selectedWidget.widget_key}/visitors/`)
            .then((res) => res.json())
            .then((data) => setVisitors(data))
            .catch((error) => console.error("Error fetching visitors:", error));
    }, [selectedWidget, apiBaseUrl]);

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
                                <div className="text-xl font-bold">{visitors.reduce((total, v) => total + v.messages.length, 0)}{" "} messages
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
                                    onClick={() => setSelectedWidget(widget)}
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
