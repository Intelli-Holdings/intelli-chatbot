"use client"
import {isAuthenticated} from '@/utils/Auth';
import { redirect } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { DashComponent } from "@/components/component/dash";

export default function Page() {
  useLayoutEffect(() => {
    const isAuth = isAuthenticated;
    if(!isAuth){
      redirect("/auth/register")
    }
  }, [])
  return (
    <div className="h-full">
      <DashComponent />
      </div>
  );
}
