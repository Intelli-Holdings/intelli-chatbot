"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { login } from "@/lib/auth/authService";
import { toast } from "sonner";
import { CardTitle } from "@/components/ui/card";
import { signInSchema, type SignInFormData } from "@/lib/validations/forms";
import { logger } from "@/lib/logger";

export default function Signin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);

    const payload = {
      email: data.email,
      password: data.password,
      role: null,
      is_email_verified: false,
    };

    try {
      const response = await login(payload);
      logger.info("Login successful", { data: response });
      toast.success("You have successfully logged In.");
      router.push("/dashboard");
    } catch (error) {
      logger.error("Login failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Your login details are incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <CardTitle className="flex items-center justify-center" />
        <h1 className="text-center text-2xl font-semibold">Login to Continue</h1>
        <Form {...form}>
          <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email</FormLabel>
                  <FormControl>
                    <Input placeholder="youremail@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="**********" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <Link href="/auth/forgotPassword" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-blue-600 text-white"
              variant="default"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
          <Link href="/auth/register" className="text-sm font-medium text-blue-600">
            Create One
          </Link>
        </div>
      </div>
    </div>
  );
}
