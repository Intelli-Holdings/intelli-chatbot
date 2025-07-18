import React from "react";
import {Pricing} from "@/components/component/pricing";
import PricingComponent from "@/components/component/pricingcomponent";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/ChatWidget";

export default function pricingPage (){
    return (
        <div className="relative">
            <Navbar />
            <main className="pt-20">
                <PricingComponent/>
            </main>
            <ChatWidget />
        </div>
    );
};