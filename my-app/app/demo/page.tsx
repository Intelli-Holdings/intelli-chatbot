"use client";
import React from "react";
import { ChatPreview } from "@/components/chat-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import '@/styles/ChatWidget.css'
import ChatWidget from "@/components/chat-widget/chat-widget";

interface Props {}

export default function demoPage (){
 
    const renderWebsite = () => {
        const url = (document.getElementById("url") as HTMLInputElement).value;
        (document.getElementById("websiteFrame") as HTMLIFrameElement).src = url;
      };
    
    return (
      <main>

      
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/100 border-b bg-background/15 backdrop-blur z-20">   
    <div className="h-full flex items-center justify-between py-2 px-2 ">
 
   <Input className="m-2 border shadow-sm" type="text" id="url" placeholder="https://www.meltwater.org" /> 

    <Button onClick={renderWebsite} className="bg-blue-600 text-white px-2 py-2 border border-blue-500 shadow-md"> Preview </Button>
    </div> 
    </div>
      <ChatWidget 
      widgetKey="6N5QE8pBfOaPPlxdDAifrcAGoW5e0wrMfPWk0gNGzUk7g2AvGh"
      backendUrl="https://intelli-python-backend-lxui.onrender.com/widgets/send-message/"
      />      
      </main>      
    );
};