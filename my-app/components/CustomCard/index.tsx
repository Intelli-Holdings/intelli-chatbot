"use client";
import React from "react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
// Shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CustomCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  const { closeOnborda } = useOnborda();

  function handleConfetti() {
    closeOnborda();
    confetti({
      particleCount: 500,
      spread: 170,
      origin: { y: 0.6 },
    });
  }

  return (
    <Card className="border shadow-lg rounded-xl w-full max-w-[min(320px,calc(100vw-2rem))]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span>{step.icon}</span>
              <span className="truncate">{step.title}</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Step {currentStep + 1} of {totalSteps}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => closeOnborda()}
            className="hover:bg-gray-100 h-8 w-8 shrink-0"
          >
            <X size={14} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div
            className="bg-[#007fff] h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{step.content}</p>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex justify-between w-full gap-2">
          {currentStep !== 0 && (
            <Button
              onClick={() => prevStep()}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Previous
            </Button>
          )}
          {currentStep + 1 !== totalSteps && (
            <Button
              onClick={() => nextStep()}
              size="sm"
              className="bg-[#007fff] hover:bg-[#0067d6] text-white text-xs ml-auto"
            >
              Next
            </Button>
          )}
          {currentStep + 1 === totalSteps && (
            <Button
              onClick={() => handleConfetti()}
              size="sm"
              className="bg-[#007fff] hover:bg-[#0067d6] text-white text-xs ml-auto"
            >
              Finish 🎉
            </Button>
          )}
        </div>
      </CardFooter>

      <span className="text-card">{arrow}</span>
    </Card>
  );
};

export default CustomCard;
