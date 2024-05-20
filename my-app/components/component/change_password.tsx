"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { changePassword } from "@/lib/auth/authService";
import { toast } from 'sonner';
import { CardDescription, CardTitle } from "@/components/ui/card";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export default function ChangePassword() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const handleSubmit = async (data) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully.');
      // Optionally, you can redirect the user to a different page after successful password change
      // router.push('/dashboard');
    } catch (error) {
      toast.error('Error changing password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <h1 className="text-center text-2xl font-semibold">Change Password</h1>
        <CardDescription>If your account seems to be compromised, we suggest password change.</CardDescription>
        <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="oldPassword">
              Old Password (Current)
            </label>
            <Input
              {...form.register('oldPassword')}
              id="oldPassword"
              placeholder="Enter your current password"
              type="password"
              required
            />
            {form.formState.errors.oldPassword && (
              <p className="text-red-500">{form.formState.errors.oldPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
              New Password
            </label>
            <Input
              {...form.register('newPassword')}
              id="newPassword"
              placeholder="Enter a new password"
              type="password"
              required
            />
            {form.formState.errors.newPassword && (
              <p className="text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <Button className="w-full bg-blue-600 text-white" variant="default" type="submit">
            Change Password
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">Changed your mind? </span>
          <Link href="/" className="text-sm font-medium text-blue-600">
            Go back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}