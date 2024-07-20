import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type YearlyPlan = {
  price: number;
  original: number;
  period: string;
  saving: number;
};

type MonthlyPlan = {
  price: number;
  period: string;
  minimum: string;
};

type PlanType = {
  yearly: YearlyPlan;
  monthly: MonthlyPlan;
};

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  const plans: PlanType = {
    yearly: {
      price: 384,
      original: 480,
      period: 'YEARLY',
      saving: 96,
    },
    monthly: {
      price: 40,
      period: 'MONTHLY',
      minimum: '3 month minimum',
    },
  };

  const benefits = [
    'Elli (Website widget) powered with AI',
    'Whatsapp AI assistant',
    'Dashboard to track Conversations + Notifications',
    'Technical support from our dedicated team',
  ];

  const addOns = [
    '$25/month extra per AI assistants, if requested',
  ];

  const isYearlyPlan = (plan: YearlyPlan | MonthlyPlan): plan is YearlyPlan => {
    return 'original' in plan && 'saving' in plan;
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-2">
        Pricing that lets you build your business better.
      </h2>
      <p className="text-center text-gray-600 mb-12">
        As a business, you only pay for what you have used which scales with you as your business grows.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="flex flex-col gap-4 md:w-1/3">
          {(Object.entries(plans) as [string, YearlyPlan | MonthlyPlan][]).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
                selectedPlan === key ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
              onClick={() => setSelectedPlan(key as 'yearly' | 'monthly')}
            >
              {isYearlyPlan(plan) && (
                <div className="text-sm text-gray-500 line-through">${plan.original}</div>
              )}
              <div className="text-3xl font-bold">${plan.price}</div>
              <div className="text-gray-600">{plan.period}</div>
              {isYearlyPlan(plan) && (
                <div className="text-blue-600 font-semibold">Save ${plan.saving}</div>
              )}
              {'minimum' in plan && (
                <div className="text-sm text-gray-600">{plan.minimum}</div>
              )}
            </div>
          ))}
        </div>

        <div className="md:w-2/3 bg-white p-8 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-2xl font-bold mb-6">
            {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription includes
          </h3>
          <ul className="space-y-4 mb-8">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <h4 className="text-xl font-semibold mb-4">Add-ons</h4>
          <ul className="space-y-2 mb-8">
            {addOns.map((addOn, index) => (
              <li key={index} className="flex items-center">
                <span className="text-gray-600">{addOn}</span>
              </li>
            ))}
          </ul>

          <Link href="/auth/sign-up">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md">
              GET STARTED
            </Button>
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            Additional AI assistants are not included in the price of subscription. They are provided upon request by businesses.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
