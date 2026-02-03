'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { register } from "@/lib/auth/authService"
import { toast } from 'sonner';
import Image from "next/image"
import {
    CardTitle,
    CardDescription,
    CardContent,
    Card,
  } from "@/components/ui/card";

import * as React from 'react';
import { useSignUp } from '@clerk/nextjs';

export default function SignUpComponent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // After successful sign-up, log the email address
      console.log('User signed up with email:', emailAddress);

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <form onSubmit={onPressVerify}>
        <input
          value={code}
          placeholder="Code..."
          onChange={(e) => setCode(e.target.value)}
        />
        <button>Verify Email</button>
      </form>
    );
  }

  return (
    <div key="1" className="flex min-h-screen ">
        <div className="m-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <form className="mt-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
        <Input
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          id="email"
          name="email"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          name="password"
        />
      </div>
      <div className="mt-6">
        <Button className="w-full bg-blue-600 text-white shadow-md " type="submit">Sign up</Button>
      </div>
    </form>
    <div className="mt-4 text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link className="text-blue-600" href="/auth/login">
              Log In
            </Link>
          </p>
        </div>

        </div>
    </div>
    
  );
}