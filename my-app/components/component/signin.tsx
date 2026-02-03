"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { login, logout } from "@/lib/auth"; 
import { toast } from 'sonner';
import Image from "next/image"
import { CardTitle } from "@/components/ui/card"

import Cookies from 'js-cookie'; 

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('You have successfully logged in.');
        router.push('/dashboard');
      } else {
        toast.error('Your login details are incorrect. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Redirect to the login page or perform any additional actions
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <CardTitle className="flex items-center justify-center">
          {/* Your logo or header */}
        </CardTitle>
        <h1 className="text-center text-2xl font-semibold">Login to Continue</h1>
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Work Email
            </label>
            <Input id="email" placeholder="youremail@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <Input id="password" placeholder="**********" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Link href="/auth/forgotPassword" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <Button className="w-full bg-blue-600 text-white" variant="default" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
          <Link href="/auth/register" className="text-sm font-medium text-blue-600">
            Create One
          </Link>
        </div>
        {/* Add a logout button for testing purposes */}
        
      </div>
    </div>
  )
}