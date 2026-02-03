"use client";

import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const steps = [
  { 
    id: 1, 
    name: 'Create Organization', 
    fields: [
      { name: 'organizationName', label: 'Organization Name', type: 'text' },
      { name: 'email', label: 'Email Address', type: 'email' },
      { name: 'phone', label: 'Phone Number', type: 'tel' }
    ]
  },
  { 
    id: 2, 
    name: 'Invite Employee', 
    fields: [
      { name: 'employeeEmail', label: 'Employee Email', type: 'email' }
    ]
  },
  { 
    id: 3, 
    name: 'Choose Channel', 
    fields: [
      { name: 'channel', label: 'Communication Channel', type: 'select', options: ['Email', 'Slack', 'Teams'] }
    ]
  },
  { 
    id: 4, 
    name: 'Create Business Appservice', 
    fields: [
      { name: 'appserviceName', label: 'App Service Name', type: 'text' }
    ]
  },
  { 
    id: 5, 
    name: 'Connect Business Socials', 
    fields: [
      { name: 'facebook', label: 'Facebook Page URL', type: 'url' },
      { name: 'twitter', label: 'Twitter Handle', type: 'text' }
    ]
  }
];

interface Step {
  id: number;
  name: string;
  fields: { name: string; label: string; type: string; options?: string[] }[];
}

interface ChecklistItemProps {
  step: Step;
  isCompleted: boolean;
  isActive: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ step, isCompleted, isActive }) => (
  <div className={`flex items-center p-2 ${isActive ? 'bg-blue-50' : ''}`}>
    {isCompleted ? (
      <CheckCircle2 className="text-green-500 mr-2" />
    ) : (
      <Circle className="text-gray-300 mr-2" />
    )}
    <span className={`${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
      {step.name}
    </span>
  </div>
);

const IntelliSetupChecklist = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const currentStep = steps[activeStep];
    const isStepComplete = currentStep.fields.every(field => formData[field.name as keyof typeof formData]);
    
    if (isStepComplete) {
      setCompletedSteps([...completedSteps, currentStep.id]);
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="items-start min-h-screen ">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl flex">
        <div className="w-1/3 pr-6 border-r">
          <h2 className="text-xl font-bold mb-4">Setup Checklist</h2>
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}% complete</p>
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <ChecklistItem
                key={step.id}
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                isActive={activeStep === index}
              />
            ))}
          </div>
        </div>
        <div className="w-2/3 pl-6">
          <h3 className="text-lg font-semibold mb-4">{steps[activeStep].name}</h3>
          <form onSubmit={handleSubmit}>
            {steps[activeStep].fields.map((field) => (
              <div key={field.name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    onChange={handleInputChange}
                    value={formData[field.name] || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Select {field.label}</option>
                    {(field as { options: string[] }).options.map(option => (
  <option key={option} value={option}>{option}</option>
))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    onChange={handleInputChange}
                    value={formData[field.name] || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                )}
              </div>
            ))}
            <div className="mt-6">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntelliSetupChecklist;