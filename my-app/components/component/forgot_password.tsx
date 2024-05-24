"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/authService";
import { toast } from 'sonner';
import { CardDescription } from "@/components/ui/card";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email,
    };

    try {
      await forgotPassword(payload);
      toast.success('Password reset link has been sent to your email.');
      setEmailSent(true);
      setEmail('');
    } catch (error) {
      console.log('Error:', error); // Log the complete error message
      toast.error('Failed to send password reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading && emailSent) {
      router.push('/auth/verifyEmail');
    }
  }, [loading, emailSent, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <h1 className="text-center text-2xl font-semibold">Forgot Your Password?</h1>
        <CardDescription>
          We shall send a password reset link to your email address
        </CardDescription>
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email Address
            </label>

            <Input
              id="email"
              placeholder="johngillete@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button className="w-full bg-blue-600 text-white" variant="default" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Forgot Password'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">Did you finally remember it?, Go back to home </span>
          <Link href="/auth/register" className="text-sm font-medium text-blue-600">
            and Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}