'use client'

import { DashComponent } from "@/components/component/dash"
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="container mx-auto px-golden-lg py-golden-lg">
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <DashComponent />
      </Suspense>      
    </div>
  )
}
