"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createUser } from "@/lib/firebase/auth"
import { toast } from 'sonner';
import Image from "next/image"
import { CardTitle } from "@/components/ui/card"
import logo from "@/public/Logo.svg"

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
    try {
      await createUser(email, password);
      toast.success('You have created an account successfully.');
      router.push('/dashboard');
    } catch (error) {
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
  <Image alt="Intelli Logo" src={logo} />
</CardTitle>
        <h1 className="text-black text-xl font-semibold text-gray-700 text-center">Create a free account</h1>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700" htmlFor="first-name">
                First Name
              </label>
              <Input id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)}  placeholder="John" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700" htmlFor="last-name">
                Last Name
              </label>
              <Input id="last-name" value={lastName} onChange={e => setLastName(e.target.value)}  placeholder="Doe" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="company-name">
              Company Name
            </label>
            <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Aqua Safari" />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="role">
              Role in Company
            </label>
            <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="Manager" />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Work Email
            </label>
            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="youremail@company.com" type="email" />
          </div>
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <Input id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="************" type="password" />
          </div>
          <div className="mt-6">
            <Button type="submit" className="w-full  bg-blue-600 text-white">Signup</Button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm">
            Already have an account?
            <Link className="text-blue-600" href="/auth/login">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
