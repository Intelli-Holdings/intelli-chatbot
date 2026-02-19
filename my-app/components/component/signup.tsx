"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { register } from "@/lib/auth/authService"
import { toast } from 'sonner';
import Image from "next/image"
import { CardTitle } from "@/components/ui/card"
import logo from "@/public/Intelli.svg"
import { v4 as uuidv4 } from 'uuid';

export default function Signup() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const companyId = uuidv4(); // Generate a unique company ID

    const payload = {
      email,
      role,
      password,
      is_email_verified: false,
      company_id: companyId, // Include the company ID in the payload
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
    };

    try {
      const response = await register(payload);
      console.log('Registration successful:', response);
      toast.success('You have created an account successfully.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Error creating an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      router.push('/loading');
    }
  }, [loading, router]);

  return (
    <div key="1" className="flex min-h-screen bg-[#E5F4FF]">
      <div className="m-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <CardTitle className="flex items-center justify-center">
         
        </CardTitle>
        <h1 className="text-black text-2xl font-semibold text-gray-700 text-center">Create Account</h1>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700" htmlFor="first-name">
                First Name
              </label>
              <Input id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" required />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700" htmlFor="last-name">
                Last Name
              </label>
              <Input id="last-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" required />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="company-name">
              Company Name
            </label>
            <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Aqua Safari" required />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="role">
              Role in Company
            </label>
            <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="Manager" required />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Work Email
            </label>
            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="youremail@company.com" type="email" required />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <Link href="/auth/forgotPassword" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            <Input id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="************" type="password" required />
          </div>
          <div className="mt-6">
            <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
              {loading ? 'Signing up...' : 'Signup'}
            </Button>
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




