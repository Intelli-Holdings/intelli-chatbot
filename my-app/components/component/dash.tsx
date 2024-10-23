"use client";

import React from "react";
import { useState } from "react";
import Dashboard from "../dashboard/main";

//
import { NextStepProvider, NextStep, useNextStep } from "nextstepjs";
import { steps } from "../../utils/tourSteps";
import ShadcnCustomCard from "../CustomCard";


export function DashComponent() {

  return (
    <NextStepProvider>
      <NextStep steps={steps} cardComponent={ShadcnCustomCard}>
        <div className="space-y-8" id="step1">
          {/* Dashboard content */}
          <Dashboard />
        </div>
      </NextStep>
    </NextStepProvider>
  );
}
