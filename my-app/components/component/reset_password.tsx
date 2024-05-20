"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/auth/authService";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      toast.success("Password reset email sent successfully.");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <CardTitle className="flex justify-center">
          <h1 className="text-2xl font-semibold">Reset Your Password</h1>
        </CardTitle>
        <CardDescription>
          Enter your email address, and we shall send you a link to reset your password.
        </CardDescription>
        <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <Input
              {...form.register("email")}
              id="email"
              placeholder="youremail@company.com"
              type="email"
              required
            />
            {form.formState.errors.email && (
              <p className="text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button className="w-full bg-blue-600 text-white" variant="default" type="submit">
            Reset Password
          </Button>
        </form>
        <div className="mt-4">
          <span className="text-sm text-gray-500">
           Did not receive a password reset link{" "}
          </span>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-blue-600"
          >
            Resend message
          </Link>
        </div>
      </div>
    </div>
  );
}