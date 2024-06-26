"use client";
import React from "react";
import { ChatPreview } from "@/components/chat-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {}

export default function demoPage (){
    const renderWebsite = () => {
        const url = (document.getElementById("url") as HTMLInputElement).value;
        (document.getElementById("websiteFrame") as HTMLIFrameElement).src = url;
      };
    
    return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/100 border-b bg-background/15 backdrop-blur z-20">   
    <div className="h-full flex items-center justify-between px-2 py-2">
    <Input type="text" id="url" placeholder="https://www.meltwater.org" />  
    <br></br>
    <Button onClick={renderWebsite} className="bg-blue-600 text-white px-2 py-2"> Preview Website </Button>
        
    </div>
      <ChatPreview/>      
      </div>        
    );
};