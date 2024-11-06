import React from 'react';
import { useState, useEffect } from "react";
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from 'next/router';
import { useNextStep } from "nextstepjs";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';

interface User {
    photoURL: string | null;
    displayName: string | null;
    email: string | null;
    firstName: string | null;
    companyName: string | null;
}

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

    // Card data to make maintenance easier
    const cards = [
        {
            id: "step2",
            emoji: "🏢",
            title: "Create a team/organization",
            description: "Collaborate with your team",
            href: "/dashboard/organization"
        },
        {
            id: "step3",
            emoji: "🛠️",
            title: "Create an Assistant",
            description: "Choose a channel and start building",
            href: "/dashboard/channels"
        },
        {
            id: "step4",
            emoji: "🔔",
            title: "View Notifications",
            description: "Never miss time-sensitive messages",
            href: "/dashboard/notifications"
        },
        {
            id: "step5",
            emoji: "💭",
            title: "View Conversations",
            description: "See your chats with customers",
            href: "/dashboard/conversations"
        },
        {
            id: "step6",
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

            <div className="min-h-200 bg-blue-100 rounded-b-2xl">
                {/* Top banner */}
                <div className='w-full'>
                    <div className="bg-[#007fff] text-white py-12 px-10 pt-6 sm:pt-12 sm:bg-blue sm:rounded-t-2xl">
                        <h1 className="text-3xl font-bold">Welcome, <span style={{ color: 'yellow' }}>{user.firstName}</span></h1>
                        <p className="text-lg">Overview of Intelli</p>
                    </div>
                    <svg width="500" height="80" viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full hidden sm:block">
                        <path d="M0,0 L0,40 Q250,80 500,40 L500,0 Z" fill="#007fff"></path>
                    </svg>
                </div>

                {/* Dashboard grid */}
                <div className="max-w-6xl mx-auto mt-0 p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Render standard cards */}
                        {cards.map((card) => (
                            <Link href={card.href} key={card.id}>
                                <div
                                    id={card.id}
                                    className="bg-white shadow-md p-6 rounded-lg flex flex-col justify-between 
                                             hover:shadow-md transition-shadow cursor-pointer transform hover:scale-105
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

                        {/* Social Media Card - Special case due to different layout */}
                        <div id="step7" className="bg-white shadow-md p-6 rounded-lg flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <div className="text-2xl mb-4">🤝</div>
                                <h2 className="text-xl font-semibold">Follow us on Socials</h2>
                                <p className="text-gray-600 mt-1">Catch our product announcements</p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <a 
                                    href="https://www.linkedin.com/company/intelli-concierge/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label="Follow us on LinkedIn"
                                    className="hover:scale-110 transition-transform duration-200"
                                >
                                    <FaLinkedin className="text-2xl text-gray-700 hover:text-blue-600 transition-colors" />
                                </a>

                                <a 
                                    href="https://www.instagram.com/intelli_concierge/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label="Follow us on Instagram"
                                    className="hover:scale-110 transition-transform duration-200"
                                >
                                    <FaInstagram className="text-2xl text-gray-700 hover:text-pink-500 transition-colors" />
                                </a>

                                <span className="text-gray-600 ml-auto">Click the icons</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;