"use client";

import React from "react";
import { useState } from "react";
import Dashboard from "../dashboard/main";
import { OnbordaProvider, Onborda, useOnborda } from "onborda";

//
import { NextStepProvider, NextStep, useNextStep } from "nextstepjs";
import { steps } from "../../utils/tourSteps";
import CustomCard from "../CustomCard";


export function DashComponent() {

  return (
    <OnbordaProvider>
      <Onborda 
      steps={steps}
      showOnborda={true}
      shadowRgb="55,48,160"
      shadowOpacity="0.2"
      cardComponent={CustomCard}
      cardTransition={{ duration: 0.3, type: "tween" }}
      >
        <div className="space-y-8" id="onborda-step1">
          {/* Dashboard content */}
          <Dashboard />
        </div>
      </Onborda>
    </OnbordaProvider>
  );
}
