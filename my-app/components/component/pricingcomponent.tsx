"use client";

import React, { useState } from 'react';
import PricingCard from './pricingCard';
import PricingAddons from './pricing-addons';
import PricingServices from './pricing-services';
import PricingFaq from './pricing-faq';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatsAppTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  contacts: string;
  teamMembers: number;
  whatsappNumbers: number;
}

const whatsAppTiers: WhatsAppTier[] = [
  { id: 'basic', name: 'Basic', monthlyPrice: 35, annualPrice: 350, contacts: '2,000', teamMembers: 1, whatsappNumbers: 1 },
  { id: 'grow', name: 'Grow', monthlyPrice: 55, annualPrice: 550, contacts: '10,000', teamMembers: 2, whatsappNumbers: 1 },
  { id: 'pro', name: 'Pro', monthlyPrice: 75, annualPrice: 750, contacts: '100,000', teamMembers: 3, whatsappNumbers: 1 },
  { id: 'elite', name: 'Elite', monthlyPrice: 86, annualPrice: 860, contacts: 'Unlimited', teamMembers: 10, whatsappNumbers: 2 },
  { id: 'scale', name: 'Scale', monthlyPrice: 108, annualPrice: 1080, contacts: 'Unlimited', teamMembers: 15, whatsappNumbers: 3 },
  { id: 'legacy', name: 'Legacy', monthlyPrice: 214, annualPrice: 2140, contacts: 'Unlimited', teamMembers: 20, whatsappNumbers: 5 },
];

const PricingComponent = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [selectedTierId, setSelectedTierId] = useState<string>('basic');

  const selectedTier = whatsAppTiers.find((t) => t.id === selectedTierId) ?? whatsAppTiers[0];

  const plans = [
    {
      name: 'Website Widget',
      monthlyPrice: 15,
      annualPrice: 150,
      originalMonthlyPrice: 19,
      originalAnnualPrice: 180,
      features: [
        'AI-powered website chat widget',
        'Live Chat',
        'Basic technical support (Email)',
        'Customizable chat widget appearance',
        '1000 Message credits (1M Tokens) per month',
        '1 team member seat ($5/mo per extra seat)',
      ],
      description: 'Perfect for small businesses looking to automate customer support.',
      buttonText: 'Start Free Trial',
      link: '/auth/sign-up',
    },
    {
      name: 'WhatsApp AI Assistant',
      monthlyPrice: selectedTier.monthlyPrice,
      annualPrice: selectedTier.annualPrice,
      features: [
        `Up to ${selectedTier.contacts} contacts`,
        `${selectedTier.teamMembers} team member${selectedTier.teamMembers > 1 ? 's' : ''} ($5/mo per extra seat)`,
        `${selectedTier.whatsappNumbers} WhatsApp Business API number${selectedTier.whatsappNumbers > 1 ? 's' : ''}`,
        'Live chat with team inbox',
        <>WhatsApp Broadcast (<a href="https://business.whatsapp.com/products/platform-pricing?country=Rest%20of%20Africa&currency=Dollars%20(USD)&category=Marketing" target="_blank" rel="noopener noreferrer" className="text-[#007fff] underline hover:text-[#006ad9]">Meta charges</a>)</>,
        'Broadcast campaign analytics & tags',
        '1,000 AI credits (1M tokens) per month',
      ],
      description: 'For growing businesses engaging customers on WhatsApp.',
      buttonText: 'Start Free Trial',
      link: '/auth/sign-up',
      isRecommended: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      originalPrice: null,
      features: [
        'Custom AI solution development',
        'Dedicated account manager',
        'Premium support',
        'Custom API integration',
        'Advanced security features',
        'Custom AI training capabilities',
        'Multichannel package',
      ],
      description: 'Tailored solutions for large-scale organizations.',
      buttonText: 'Book a Discovery Call',
      link: 'https://cal.com/intelli-demo/30min?user=intelli-demo',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="container mx-auto px-4 py-20">
        <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Start your 7-day free trial today. No credit card required.
          </p>

          {/* Simplified Tab-style Billing Selector */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg mt-8">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                !isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              {isAnnual && (
                <span className="ml-4 text-xs font-medium text-[#007fff]">-2months</span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const originalPrice = isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice;
            const period = isAnnual ? '/year' : '/month';

            const isWhatsApp = plan.name === 'WhatsApp AI Assistant';

            return (
              <PricingCard
                key={plan.name}
                title={plan.name}
                price={price !== null ? `$${price}${period}` : 'Custom'}
                originalPrice={originalPrice ? `$${originalPrice}${period}` : ''}
                description={plan.description}
                features={plan.features}
                buttonText={plan.buttonText}
                isRecommended={plan.isRecommended}
                link={plan.link}
                tierSelector={
                  isWhatsApp ? (
                    <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                      <SelectTrigger className="w-full bg-white border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {whatsAppTiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name} — Up to {tier.contacts} contacts
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : undefined
                }
              />
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-4">
            All plans include: Conversations analytics, Multi-language support and Industry-standard security.
          </p>
          <div className="flex justify-center items-center space-x-8">
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              7-day free trial
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      <PricingAddons />
      <PricingServices />
      <PricingFaq />
    </div>
  );
};

export default PricingComponent;