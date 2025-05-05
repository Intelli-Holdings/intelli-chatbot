"use client";
import React, { useState } from "react";
import { ChatPreview } from "@/components/chat-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {}

export default function demoPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            renderWebsite();
        }
    };

    const renderWebsite = () => {
        setIsLoading(true);
        setError(null);
        let url = (document.getElementById("url") as HTMLInputElement).value;
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const iframe = document.getElementById("websiteFrame") as HTMLIFrameElement;
        iframe.onload = () => {
            setIsLoading(false);
        };
        iframe.onerror = () => {
            setIsLoading(false);
            setError("Unable to load the website. Please check the URL and try again.");
        };
        
        iframe.src = url;
    };

    return (
        <main>
            <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/100 border-b bg-background/15 backdrop-blur z-20">   
                <div className="h-full flex items-center justify-between py-2 px-2">
                    <Input 
                        className="m-2 border shadow-sm" 
                        type="text" 
                        id="url" 
                        placeholder="enter your website url here https://yourwebsite.com"
                        onKeyDown={handleKeyDown}
                    /> 

                    <Button 
                        onClick={renderWebsite} 
                        className="bg-blue-600 text-white px-2 py-2 border border-blue-500 shadow-md"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Preview"
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mt-20 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
        </main>      
    );
}