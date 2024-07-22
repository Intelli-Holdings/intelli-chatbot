// PrivacyPolicyClient.tsx
"use client";

import React, { useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Country = 'Ghana' | 'Kenya' | 'USA' | 'EU';

interface PrivacyPolicyClientProps {
  initialPolicies: Record<Country, string>;
}

export default function PrivacyPolicyClient({ initialPolicies }: PrivacyPolicyClientProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>('Ghana');

  const countries: Country[] = ['Ghana', 'Kenya', 'USA', 'EU'];

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="flex justify-center mb-8">
        {countries.map((country) => (
          <Toggle
            key={country}
            pressed={selectedCountry === country}
            onPressedChange={() => handleCountryChange(country)}
            className="mx-2"
          >
            {country}
          </Toggle>
        ))}
      </div>

      {initialPolicies[selectedCountry] ? (
        <div 
          className="prose max-w-none" 
          dangerouslySetInnerHTML={{ __html: initialPolicies[selectedCountry] }} 
        />
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load policy content. Please try again later.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}