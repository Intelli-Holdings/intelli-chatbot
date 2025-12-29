"use client"

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNextStep } from "nextstepjs";
import { useUser } from "@clerk/nextjs";
// Onborda
import { useOnborda } from "onborda";
import { DynamicDashboard } from './dynamic-dashboard';

const Dashboard: React.FC = () => {
    const { startOnborda, closeOnborda } = useOnborda();
    const handleStartOnborda = () => {
        startOnborda('mainTour');
    };
    const { closeNextStep } = useNextStep();
    const { isLoaded, isSignedIn, user } = useUser();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        closeOnborda();
        closeNextStep();
    }, [closeOnborda, closeNextStep]);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    if (!mounted) {
        return null;
    }

    const displayName = user?.firstName ?? "there";

    return (
        <div className="space-y-8">
            {/* Welcome Header with Tour Button */}
            <div
                id="onborda-step1"
                className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                            Welcome, <span className="text-[#007fff]">{displayName}</span>
                        </h1>
                        <p className="text-sm text-gray-600 sm:text-base">
                            Here's what's happening with your business today
                        </p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    className="h-10 rounded-full bg-[#007fff] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0067d6]"
                                    onClick={handleStartOnborda}
                                >
                                    <Sparkles size={16} className="mr-2" /> Take Tour
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Get a quick tour of IntelliConcierge</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Dynamic Dashboard with Real Metrics */}
            <DynamicDashboard />
        </div>
    );
};

export default Dashboard;
