import { Button } from "@/components/ui/button";
import { type ButtonHTMLAttributes } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GradientButton({ children, className, ...props }: GradientButtonProps) {
  return (
    <Button
      className={`bg-gradient-to-br from-dreamBlue to-[#0066cc] text-white font-semibold px-8 py-3.5 rounded-[10px] h-auto hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,127,255,0.35)] transition-all border-0 ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
}
