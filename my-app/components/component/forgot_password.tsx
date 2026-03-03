"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/authService";
import { toast } from "sonner";
import { CardDescription } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/forms";
import { logger } from "@/lib/logger";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      await forgotPassword({ email: data.email });
      toast.success("Password reset link has been sent to your email.");
      setEmailSent(true);
      form.reset();
    } catch (error) {
      logger.error("Password reset error", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to send password reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading && emailSent) {
      router.push("/auth/verifyEmail");
    }
  }, [loading, emailSent, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <h1 className="text-center text-2xl font-semibold">Forgot Your Password?</h1>
        <CardDescription>We shall send a password reset link to your email address</CardDescription>
        <Form {...form}>
          <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="johngillete@gmail.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-blue-600 text-white"
              variant="default"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Forgot Password"}
            </Button>
          </form>
        </Form>
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
