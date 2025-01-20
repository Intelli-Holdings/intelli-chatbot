import React from 'react';
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNextStep } from "nextstepjs";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';

const Dashboard: React.FC = () => {
    const { startNextStep } = useNextStep();
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const { isLoaded, isSignedIn, user } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onClickHandler = (tourName: string) => {
        setIsBannerVisible(false);
        startNextStep(tourName);
    };

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    // Unique card data
    const cards = [
        {
            id: "step2",
            emoji: "🛠️",
            title: "Create an Assistant",
            description: "Choose a channel and start building",
            href: "/dashboard/assistants"
        },
        {
            id: "step3",
            emoji: "🔔",
            title: "View Notifications",
            description: "Never miss time-sensitive messages",
            href: "/dashboard/notifications"
        },
        {
            id: "step4",
            emoji: "💭",
            title: "View Conversations",
            description: "See your chats with customers",
            href: "/dashboard/conversations"
        },
        {
            id: "step5",
            emoji: "📊",
            title: "View your Analytics",
            description: "Deep dive into your usage",
            href: "/dashboard/analytics"
        }
    ];

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Tour Button */}
            <div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="default"
                                className="mr-2 bg-[#007fff] rounded-xl pt-2"
                                onClick={() => onClickHandler('mainTour')}
                            >
                                <Sparkles size={16} className="mr-2" /> Click to Start Tour
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This gives you a product tour of Intelli</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="min-h-200 bg-gradient-to-t from-gray-500/10 to-background rounded-t-lg rounded-b-2xl">
                {/* Top banner */}
                <div className='w-full'>
                    <div className=" bg-gradient-to-b from-[#007fff] to-background p-2 shadow-sm border rounded-t-lg rounded-b-xl border-indigo-200 bg-[#007fff] py-12 px-10 pt-6 sm:pt-12 sm:bg-blue sm:rounded-t-lg">
                        <h1 className="text-3xl font-bold">Welcome, <span style={{ color: 'yellow' }}>{user.firstName}</span></h1>
                        <p className="text-lg">Overview of Intelli</p>
                    </div>
                    
                </div>

                {/* Dashboard grid */}
                <div className="max-w-auto mx-auto mt-0 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Render standard cards */}
                        {cards.map((card) => (
                            <Link href={card.href} key={card.id}>
                                <div
                                    id={card.id}
                                    className="bg-white shadow-sm p-6 rounded-lg flex flex-col justify-between 
                                            hover:shadow-md transition-none cursor-pointer transform hover:scale-105
                                            transition-all duration-100 ease-in-out"
                                >
                                    <div>
                                        <div className="text-2xl mb-4">{card.emoji}</div>
                                        <h2 className="text-xl font-semibold">{card.title}</h2>
                                        <p className="text-gray-600 mt-1">{card.description}</p>
                                    </div>
                                    <div className="text-right mt-4">
                                        <span className="text-black hover:text-blue-600">↗</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
