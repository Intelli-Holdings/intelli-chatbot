"use client"
import React, { useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Country = 'Ghana' | 'Kenya' | 'USA' | 'EU';

interface PrivacyPolicyClientProps {
  initialPolicies: Record<Country, string>;
}

export default function PrivacyPolicyClient({ initialPolicies }: PrivacyPolicyClientProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>('Ghana');
  const countries: Country[] = ['Ghana', 'Kenya', 'USA', 'EU'];

  return (
    <div className="min-h-screen bg-gray-10 py-4 px-4 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: June 20, 2024
          </p>
        </div>

        {/* Country Selection */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex justify-center gap-4">
              {countries.map((country) => (
                <Toggle
                  key={country}
                  pressed={selectedCountry === country}
                  onPressedChange={() => setSelectedCountry(country)}
                  className="px-6 py-2 text-sm font-medium"
                >
                  {country}
                </Toggle>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Content */}
        {initialPolicies[selectedCountry] ? (
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <style jsx global>{`
                .policy-content h1 {
                  font-size: 2.25rem;
                  font-weight: 700;
                  color: #1a1a1a;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                }

                .policy-content h2 {
                  font-size: 1.75rem;
                  font-weight: 600;
                  color: #2a2a2a;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.3;
                }

                .policy-content h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #3a3a3a;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                }

                .policy-content p {
                  font-size: 1.125rem;
                  line-height: 1.7;
                  color: #4a4a4a;
                  margin-bottom: 1.25rem;
                }

                .policy-content ul, .policy-content ol {
                  margin-left: 1.5rem;
                  margin-bottom: 1.25rem;
                }

                .policy-content li {
                  font-size: 1.125rem;
                  line-height: 1.7;
                  color: #4a4a4a;
                  margin-bottom: 0.5rem;
                }

                .policy-content a {
                  color: #007fff;
                  text-decoration: none;
                  transition: color 0.2s ease;
                }

                .policy-content a:hover {
                  color: #0056b3;
                }

                .policy-content a:visited {
                  color: #800080;
                }

                .policy-content strong {
                  font-weight: 600;
                  color: #2a2a2a;
                }

                .policy-content .meta {
                  font-size: 1rem;
                  color: #666;
                  margin-bottom: 2rem;
                }
              `}</style>
              <div 
                className="policy-content"
                dangerouslySetInnerHTML={{ __html: initialPolicies[selectedCountry] }} 
              />
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load policy content. Please try again later.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}