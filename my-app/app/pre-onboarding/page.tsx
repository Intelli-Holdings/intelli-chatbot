'use client';

import CreateOrganizationStep from '@/components/CreateOrganization';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import CircuitBackground from '@/components/ui/circuit-background';

export default function PreOnboardingPage() {
  return (
    <div className="mx-auto py-10 min-h-screen relative">
      <CircuitBackground />
      <div className="container relative z-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Pre-onboarding</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Welcome to Intelli, complete these steps to get onboarded</h2>
        
  
          <p className="text-gray-600 text-center  mb-8">
            You&apos;ll need to create an organization first.
          </p>
          
          <CreateOrganizationStep />
      </div>
    </div>
  );
}
