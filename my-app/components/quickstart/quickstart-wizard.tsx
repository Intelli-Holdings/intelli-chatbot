// components/quickstart/quickstart-wizard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteDeveloper from './invite-developer';
import BuildingOptions from './building-options';
import TechnologySelection from './technology-selection';
import InstallationSteps from './installation-steps';

interface Step {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

const steps: Step[] = [
  { id: 'invite', title: 'Invite', component: InviteDeveloper },
  { id: 'building', title: 'Build', component: BuildingOptions },
  { id: 'technology', title: 'Refine', component: TechnologySelection },
  { id: 'install', title: 'Install', component: InstallationSteps },
];

export default function QuickstartWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Get started with Liveblocks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={steps[currentStep].id} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {steps.map((step, index) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                disabled={index > currentStep}
                onClick={() => setCurrentStep(index)}
              >
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={steps[currentStep].id}>
            <CurrentStepComponent />
          </TabsContent>
        </Tabs>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}