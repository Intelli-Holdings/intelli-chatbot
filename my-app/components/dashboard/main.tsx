"use client"

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useNextStep } from "nextstepjs";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
// Onborda
import { useOnborda } from "onborda";
import Channels from './channels';
import WhatsappOnboarding from '@/components/WhatsappOnboarding';
import Workground from '@/components/Workground';

const Dashboard: React.FC = () => {
    const { startOnborda } = useOnborda();
    const handleStartOnborda = () => {
        startOnborda('mainTour');
    };
    const { startNextStep } = useNextStep();
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const { isLoaded, isSignedIn, user } = useUser();
    const [mounted, setMounted] = useState(false);
    const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
    const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const onClickHandler = (tourName: string) => {
        setIsBannerVisible(false);
        startNextStep(tourName);
    };

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    // Updated card data to match tour steps
    const cards = [
        {
            id: "onborda-step2",
            emoji: "🪄",
            title: "Create an Assistant",
            description: "Your assistant works on any channel",
            href: "/dashboard/assistants"
        },
        {
            id: "onborda-step3",
            emoji: "🌐",
            title: "Create a Website Widget",
            description: "Use your assistant to create a widget",
            href: "/dashboard/playground"
        },
        {
            id: "onborda-step4",
            emoji: "📦",
            title: "Create a Whatsapp Package",
            description: "Connect your assistant to WhatsApp",
            href: "/dashboard/channels/whatsapp"
        },
        {
            id: "onborda-step5",
            emoji: "🔔",
            title: "View Notifications",
            description: "Receive time-sensitive messages",
            href: "/dashboard/notifications"
        },
        {
            id: "onborda-step6",
            emoji: "💬",
            title: "View Conversations",
            description: "Your inbox for customer messages",
            href: "/dashboard/conversations"
        },
        {
            id: "onborda-step7",
            emoji: "📊",
            title: "View Your Analytics",
            description: "Monitor your business metrics",
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
                                onClick={handleStartOnborda}
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

            <div className="min-h-200 bg-gradient-to-t from-blue-200 to-background rounded-t-lg rounded-b-2xl">
                {/* Top banner */}
                <div className='w-full' id="onborda-step1">
                    <div className=" bg-gradient-to-b from-[#007fff] to-background p-2 shadow-sm border rounded-t-lg rounded-b-xl border-indigo-200 bg-[#007fff] py-12 px-10 pt-6 sm:pt-12 sm:bg-blue sm:rounded-t-lg shadow-sm">
                        <h1 className="text-3xl font-bold">Welcome, <span style={{ color: 'yellow' }}>{user.firstName}</span></h1>
                        <p className="text-lg">Your Business Command Center</p>
                    </div>
                    
                </div>

                {/* Tabs for Overview and Channels */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="channels">Channels</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        {/* Dashboard grid */}
                        <div className="max-w-auto mx-auto mt-0 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Render cards */}
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
                    </TabsContent>
                    <TabsContent value="channels">
                        <Channels 
                            onWhatsAppCreate={() => setWhatsappDialogOpen(true)}
                            onWebsiteCreate={() => setWebsiteDialogOpen(true)}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* WhatsApp Dialog */}
            <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <WhatsappOnboarding />
                </DialogContent>
            </Dialog>

            {/* Website Widget Dialog */}
            <Dialog open={websiteDialogOpen} onOpenChange={setWebsiteDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <Workground />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Dashboard;