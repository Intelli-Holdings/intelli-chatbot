"use client";

import React, { useState } from 'react';
import PricingCard from './pricingCard'; // Assuming you have a reusable PricingCard component
import { Switch } from '@/components/ui/switch'; // Import your custom switch component

const PricingComponent = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  // Updated pricing plans based on your provided code
  const plans = [
    {
      name: 'Website Widget',
      monthlyPrice: 8,
      annualPrice: 80,  // 20% discount for annual
      originalPrice: null, // No original price for this plan
      features: [
        'Elli (Website widget) powered with AI',
        'Dashboard to track Conversations',
        'Basic technical support',
      ],
      buttonText: 'Get Started',
    },
    {
      name: 'WhatsApp Assistant',
      monthlyPrice: 20,
      annualPrice: 200,  // 20% discount for annual
      originalPrice: null, // No original price for this plan
      features: [
        'WhatsApp AI assistant',
        'Dashboard to track Conversations',
        'Takeover conversations by human agents',
        'Sentiment Analysis of conversations',
      ],
      buttonText: 'Get Started',
    },
    {
      name: 'Enterprise',
      monthlyPrice: null, // No monthly price for this plan
      annualPrice: null,  // Custom pricing
      originalPrice: null, // No original price for custom pricing
      features: [
        'Tailored AI solution',
        'Multiple AI assistants',
        'Dedicated account manager',
        'Enterprise-grade support',
        'Custom integrations',
      ],
      buttonText: 'Contact Sales',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">
          Choose a plan that works for you
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Save 20% when you pay annually. All plans include a 7-day free trial.
        </p>

        <div className="flex items-center justify-center mb-8">
          <span className={`mr-2 ${isAnnual ? 'text-gray-500' : 'font-semibold'}`}>Monthly</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="bg-blue-500"
          />
          <span className={`ml-2 ${isAnnual ? 'font-semibold' : 'text-gray-500'}`}>Annual (Save 20%)</span>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 px-4">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const period = isAnnual ? 'year' : 'month';

            return (
              <PricingCard
                key={plan.name}
                title={plan.name}
                price={price !== null ? `$${price}` : 'Custom'}
                originalPrice={plan.originalPrice ? `$${plan.originalPrice}` : ''} // Handling null for originalPrice
                description="AI-powered solutions for your business."
                features={plan.features}
                buttonText={price !== null ? `Get ${isAnnual ? 'Annual' : 'Monthly'} Access` : plan.buttonText}
                isRecommended={plan.name === 'Enterprise'}
              />
            );
          })}
        </div>

        <p className="text-sm text-gray-500 mt-8 text-center">
          All plans include a 7-day free trial. No credit card required.
        </p>
      </section>
    </div>
  );
};

export default PricingComponent;
