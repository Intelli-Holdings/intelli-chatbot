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
        { text: '1000 Message credits per month', info: '1,000 credits = 1M tokens. Credits are used for AI-powered responses.' },
        { text: '1 team member seat', info: 'Additional seats available at $5/mo per member.' },
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
        { text: `Up to ${selectedTier.contacts} contacts`, info: 'Total contacts you can store and message in your account.' },
        { text: `${selectedTier.teamMembers} team member${selectedTier.teamMembers > 1 ? 's' : ''}`, info: 'Additional seats available at $5/mo per member.' },
        { text: `${selectedTier.whatsappNumbers} WhatsApp Business API number${selectedTier.whatsappNumbers > 1 ? 's' : ''}`, info: 'Verified WhatsApp Business API integration.' },
        'Live chat with team inbox',
        <>WhatsApp Broadcast (<a href="https://business.whatsapp.com/products/platform-pricing?country=Rest%20of%20Africa&currency=Dollars%20(USD)&category=Marketing" target="_blank" rel="noopener noreferrer" className="text-[#007fff] underline hover:text-[#006ad9]">Meta charges</a>)</>,
        { text: 'Campaign analytics & tags', info: 'Track engagement per campaign — read status, reach, and segment audiences using tags.' },
        { text: '1,000 AI credits per month', info: '1,000 credits = 1M tokens. Credits are used for AI-powered responses.' },
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
        { text: 'Premium support', info: 'Priority response times with a dedicated support channel.' },
        { text: 'Custom API integration', info: 'Tailored integrations with your existing CRM, ERP, or internal tools.' },
        'Advanced security features',
        { text: 'Custom AI training', info: 'Train AI models on your business data for more accurate responses.' },
        { text: 'Multichannel package', info: 'WhatsApp, website widget, and more channels in one plan.' },
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Pricing
            </span>
          </div>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1]">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-2xl mx-auto">
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