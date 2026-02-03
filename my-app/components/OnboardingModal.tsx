"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateOrganizationStep from "@/components/CreateOrganization";
import OnboardingInfoForm from "@/components/OnboardingForm";

export default function OnboardingModal() {
  const [step, setStep] = useState(1);

  const goToNextStep = () => setStep((prevStep) => prevStep + 1);
  const closeModal = () => setStep(0);

  return (
    <Dialog open={step > 0} onOpenChange={closeModal}>
      <DialogContent>
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Sign Up</DialogTitle>
            </DialogHeader>
            <SignUp />
            <Button onClick={goToNextStep}>Proceed</Button>
          </>
        )}
        {step === 2 && (
          <>
            <CreateOrganizationStep />
            <Button onClick={goToNextStep}>Next: Tell Us About Yourself</Button>
          </>
        )}
        {step === 3 && (
          <OnboardingInfoForm onComplete={closeModal} />
        )}
      </DialogContent>
    </Dialog>
  );
}
