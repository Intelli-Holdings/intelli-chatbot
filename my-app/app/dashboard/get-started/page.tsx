// app/quickstart/page.tsx

import { Suspense } from 'react';
import GetStartedWizard from '@/components/quickstart/quickstart-wizard';
import { Skeleton } from '@/components/ui/skeleton';

export default function GetStartedPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Onboarding Checklist</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <GetStartedWizard />
      </Suspense>
    </div>
  );
}