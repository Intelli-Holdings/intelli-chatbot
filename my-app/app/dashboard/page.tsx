"use client"
import { DashComponent } from "@/components/component/dash";
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';



export default function Page() {

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
      <DashComponent />
      </Suspense>      
    </div>
  );
}