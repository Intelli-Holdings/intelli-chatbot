"use client"

// import { useRouter } from 'next/navigation';
// import { useLayoutEffect } from 'react';
import { DashComponent } from "@/components/component/dash";
// import useAuth from '@/lib/auth/useAuth';

export default function Page() {

  return (
    <div className="h-full">
      <DashComponent />
    </div>
  );
}