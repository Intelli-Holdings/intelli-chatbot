"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        
        <h1 className="text-2xl font-semibold">
          Verify Your Email
        </h1>
        <CardDescription>
          Enter the 6-digit code we sent to your email 
        </CardDescription>
        <form className=" mt-4 space-y-6">
          <div className="w-full items-center">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="code"
            >
              One-Time Passcode
            </label>
            <InputOTP className="mt-4 "  maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          
          </div>
          <Button
            className=" bg-blue-600 text-white"
            variant="default"
            type="submit"
          >
            Continue
          </Button>
        </form>
        <div className="mt-4">
          <span className="text-sm text-gray-500">
           By Clicking Continue You agree to our{" "}
          </span>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-blue-600"
          >
            T&Cs and Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}


