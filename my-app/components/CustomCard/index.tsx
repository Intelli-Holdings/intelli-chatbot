'use client';

import { CardComponentProps } from 'nextstepjs';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ShadcnCustomCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <p>{step.title}</p>
          {step.icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{step.content}</p>
        {arrow}
      </CardContent>
      <CardFooter className="flex flex-col">
        {step.showControls && (
          <div className="flex justify-between w-full">
            <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
              Previous
            </Button>
            <Button onClick={nextStep}>
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
        {step.showSkip && (
          <Button onClick={skipTour} variant={'ghost'} className="w-full">
            Skip Tour
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ShadcnCustomCard;