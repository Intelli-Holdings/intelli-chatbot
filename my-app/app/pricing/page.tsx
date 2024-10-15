import React from "react";
import {Pricing} from "@/components/component/pricing";
import PricingComponent from "@/components/component/pricingcomponent";
import { Navbar } from "@/components/navbar";

export default function pricingPage (){
    return (
        <div>
            <Navbar />
            <PricingComponent/>
        </div>
    );
};