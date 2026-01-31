"use client";

import { NextStep, NextStepProvider } from "nextstepjs";
import { OnboardingProvider } from "@/context/onboarding-context";
import { steps } from "@/utils/tourSteps";

interface TourProviderWrapperProps {
    children: React.ReactNode;
}

export const TourProviderWrapper: React.FC<TourProviderWrapperProps> = ({
    children,
}) => {
    return (
        <NextStepProvider>
            <OnboardingProvider>
                <NextStep steps={steps} showNextStep={false}>
                    {children}
                </NextStep>
            </OnboardingProvider>
        </NextStepProvider>
    );
};

export default TourProviderWrapper;
