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
    <Card className="border-0 rounded-3xl max-w-vw">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="mb-2 text-lg">
              {step.icon} {step.title}
            </CardTitle>
            <CardDescription>
              {currentStep + 1} of {totalSteps}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => closeOnborda()}
            className="hover:bg-gray-100"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {step.content}
      </CardContent>

      <CardFooter>
        <div className="flex justify-between w-full gap-4">
          {currentStep !== 0 && (
            <Button 
              onClick={() => prevStep()}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
            >
              Previous
            </Button>
          )}
          {currentStep + 1 !== totalSteps && (
            <Button 
              onClick={() => nextStep()} 
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] ml-auto"
            >
              Next
            </Button>
          )}
          {currentStep + 1 === totalSteps && (
            <Button 
              onClick={() => handleConfetti()} 
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] ml-auto"
            >
              🎉 Finish!
            </Button>
          )}
        </div>
      </CardFooter>
      
      <span className="text-card">{arrow}</span>
    </Card>
  );
};

export default CustomCard;