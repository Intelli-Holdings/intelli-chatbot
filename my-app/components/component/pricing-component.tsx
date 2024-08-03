import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type PlanType = {
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  period: string;
  features: string[];
  ctaLink: string;
};

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('website');
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  const plans: PlanType[] = [
    {
      name: 'Website Widget',
      monthlyPrice: 8,
      annualPrice: 80,  // 20% discount for annual
      period: 'month',
      features: [
        'Elli (Website widget) powered with AI',
        'Dashboard to track Conversations',
        'Basic technical support',
      ],
      ctaLink: 'https://paystack.com/pay/qc6a1bvrpu',
    },
    {
      name: 'WhatsApp Assistant',
      monthlyPrice: 20,
      annualPrice: 200,  // 20% discount for annual
      period: 'month',
      features: [
        'Whatsapp AI assistant',
        'Dashboard to track Conversations',
        'Takeover conversations by human agents',
        'Sentiment Analysis of conversations',
      ],
      ctaLink: 'https://paystack.com/pay/gnhtnpaxpg',
    },
    {
      name: 'Enterprise ',
      monthlyPrice: null,
      annualPrice: null,
      period: 'Custom',
      features: [
        'Tailored AI solution',
        'Multiple AI assistants',
        'Dedicated account manager',
        'Enterprise-grade support',
        'Custom integrations',
      ],
      ctaLink: 'https://calendly.com/sila-r0a9/30min',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-2">
        Choose the right plan for your business
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Flexible options to suit your needs and scale with your growth
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

      <div className="flex flex-col lg:flex-row justify-center gap-8">
        {plans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const period = isAnnual ? 'year' : plan.period;
          
          return (
            <div
              key={plan.name}
              className={`bg-white p-6 rounded-lg shadow-md transition-all flex-1 ${
                selectedPlan === plan.name.toLowerCase() ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                {price !== null ? (
                  <>
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-gray-600">/{period}</span>
                    {isAnnual && <div className="text-green-600 text-sm">Save 20%</div>}
                  </>
                ) : (
                  <span className="text-2xl font-semibold">Custom Pricing</span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md">
                  {price !== null ? 'Get Started' : 'Contact Sales'}
                </Button>
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 mt-8 text-center">
        All plans include a 7-day free trial. No credit card required.
      </p>
    </section>
  );
};

export default PricingSection;