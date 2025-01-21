"use client";

import React, { useState } from 'react';
import PricingCard from './pricingCard';

const PricingComponent = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  const plans = [
    {
      name: 'Website Widget',
      monthlyPrice: 15,
      annualPrice: 144,
      originalMonthlyPrice: 19,
      originalAnnualPrice: 180,
      features: [
        'AI-powered website chat widget',
        'Real-time visitor insights dashboard',
        'Basic technical support (Email)',
        '3 team member seats included',
        'Customizable chat widget appearance',
      ],
      description: 'Perfect for small businesses looking to automate customer support.',
      buttonText: 'Start Free Trial',
      link: '/auth/sign-up',
    },
    {
      name: 'WhatsApp AI Assistant',
      monthlyPrice: 35,
      annualPrice: 336,
      originalMonthlyPrice: 45,
      originalAnnualPrice: 420,
      features: [
        'WhatsApp Business API integration',
        'Advanced analytics dashboard',
        'Priority email & chat support',
        '5 team member seats included',
        'Human agent takeover capabilities',
        
      ],
      description: 'Ideal for growing businesses needing multi-channel support.',
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
        'Premium 24/7 support',
        'Unlimited team members',
        'Custom API integration',
        'Advanced security features',
        'Custom AI training capabilities',
      ],
      description: 'Tailored solutions for large-scale organizations.',
      buttonText: 'Contact Sales',
      link: 'https://cal.com/intelli/enterprise-sales',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your 7-day free trial today. No credit card required.
          </p>

          {/* Simplified Tab-style Billing Selector */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg">
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
                <span className="ml-2 text-xs font-medium text-green-500">-20%</span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const originalPrice = isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice;
            const period = isAnnual ? '/year' : '/month';

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
    </div>
  );
};

export default PricingComponent;