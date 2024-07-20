import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Waitlist from '@/components/component/waitlist';

const CTASection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-1/2">
        <div className="rounded-lg h-auto overflow-hidden bg-lavender-100 shadow-md border border-transparent hover:border-blue-500 focus-within:border-blue-500">
            <Waitlist />
          </div>
        </div>
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            Be a part of the future of Customer Service and Experience
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Become a market leader by joining our exclusive waitlist. Gain early access to Intelli AI tools and products and stay ahead.
          </p>
          
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-8 text-center max-w-4xl mx-auto">
        By joining our waitlist, you agree to our{' '}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a> and our {' '}
        <a href="/terms-of-service" className="underline">
          Terms of Service
        </a>
        . We respect your privacy and take protecting it seriously.
      </p>
    </section>
  );
};

export default CTASection;
