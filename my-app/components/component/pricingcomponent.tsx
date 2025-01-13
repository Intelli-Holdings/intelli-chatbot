"use client";

import React, { useState } from 'react';
import PricingCard from './pricingCard'; 
import { Switch } from '@/components/ui/switch'; 

const PricingComponent = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  // Updated pricing plans with added links
  const plans = [
    {
      name: 'Website Widget',
      monthlyPrice: 15,
      annualPrice: 240,  // 20% discount for annual
      originalPrice: null,
      features: [
        'Elli (Website widget) powered with AI',
        'Dashboard to track Conversations',
        'Basic technical support',
      ],
      buttonText: 'Sign Up',
      link: '/auth/sign-up',  // Link to sign-up for this plan
    },
    {
      name: 'WhatsApp Assistant',
      monthlyPrice: 38,
      annualPrice: 365,  // 20% discount for annual
      originalPrice: null,
      features: [
        'WhatsApp AI assistant',
        'Dashboard to track Conversations',
        'Takeover conversations by human agents',
        'Sentiment Analysis of conversations',
      ],
      buttonText: 'Sign Up',
      link: '/auth/sign-up',  // Link to sign-up for this plan
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,  
      originalPrice: null,
      features: [
        'Tailored AI solution',
        'Multiple AI assistants',
        'Dedicated account manager',
        'Enterprise-grade support',
        'Access to Intelli APIs',
      ],
      buttonText: 'Contact Sales',
      link: 'https://cal.com/intelli/entreprise-sales',  // Custom link for Enterprise sales
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
                originalPrice={plan.originalPrice ? `$${plan.originalPrice}` : ''}
                description="AI-powered solutions for your business."
                features={plan.features}
                buttonText={price !== null ? `Get ${isAnnual ? 'Annual' : 'Monthly'} Access` : plan.buttonText}
                isRecommended={plan.name === 'Enterprise'}
                link={plan.link}  // Add the respective link for the pricing card
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
