"use client"

import React from 'react';
import { useUser } from "@clerk/nextjs";
import { DynamicDashboard } from './dynamic-dashboard';
import { OnboardingWidget } from '@/components/onboarding/OnboardingWidget';

const Dashboard: React.FC = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    if (!mounted) {
        return null;
    }

    const displayName = user?.firstName ?? "there";

    return (
        <>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                                Welcome, <span className="text-[#007fff]">{displayName}</span>
                            </h1>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Here&apos;s what&apos;s happening with your business today
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Dashboard with Real Metrics */}
                <DynamicDashboard />
            </div>

            {/* Floating onboarding widget */}
            <OnboardingWidget />
        </>
    );
};

export default Dashboard;
