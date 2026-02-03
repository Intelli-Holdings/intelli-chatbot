import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const GradientButton = React.forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-gray-50 transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-900 dark:focus-visible:ring-gray-300",
        // before styles
        "before:absolute before:bottom-[-30%] before:left-1/2 before:z-0 before:h-1/3 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[radial-gradient(circle, rgba(255,215,0,0.5), rgba(255,140,0,0.3), rgba(255,69,0,0))] before:[filter:blur(calc(1.2*1rem))]",
        // light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#FFD700,#FFC107,#FF8C00,#FF4500)]",
        // dark mode colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,#FFD700,#FFC107,#FF8C00,#FF4500)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

GradientButton.displayName = "GradientButton";