"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/auth/authService";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const reset_token = searchParams.get("reset_token");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data) => {
    try {
      const response = await resetPassword(reset_token, data.newPassword);

      if (response.success) {
        toast.success("Password reset successful.");
        // Redirect or navigate to the desired page
      } else {
        setErrorMessage(response.error);
      }
    } catch (error) {
      if (error.message === "Token expired") {
        setErrorMessage("Invalid or expired reset token");
      } else if (error.message === "Token already used") {
        setErrorMessage("Token already used");
      } else {
        setErrorMessage("Token invalid or doesn't exist");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F4FF]">
      <div className="mx-auto my-auto w-full max-w-md rounded-lg shadow-md bg-white p-8">
        <CardTitle className="flex justify-center">
          <h1 className="text-2xl font-semibold">Reset Your Password</h1>
        </CardTitle>
        <CardDescription>Enter a new password for your account.</CardDescription>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
              New Password
            </label>
            <Input
              {...form.register("newPassword")}
              id="newPassword"
              placeholder="Enter new password"
              type="password"
              required
            />
            {form.formState.errors.newPassword && (
              <p className="text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              {...form.register("confirmPassword")}
              id="confirmPassword"
              placeholder="Confirm new password"
              type="password"
              required
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button
            className="w-full bg-blue-600 text-white"
            variant="default"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}