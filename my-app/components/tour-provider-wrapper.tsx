"use client";

import { OnboardingProvider } from "@/context/onboarding-context";

interface TourProviderWrapperProps {
    children: React.ReactNode;
}

export const TourProviderWrapper: React.FC<TourProviderWrapperProps> = ({
    children,
}) => {
    return (
        <OnboardingProvider>
            {children}
        </OnboardingProvider>
    );
};

export default TourProviderWrapper;
