"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        classNames: {
          error: "bg-red-400",
          success: "text-green-400",
          warning: "text-yellow-400",
          info: "bg-blue-400",
        },
      }}
      richColors
    />
  );
}
