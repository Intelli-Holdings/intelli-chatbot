import { Button } from "@/components/ui/button";
import { type ButtonHTMLAttributes } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GlassButton({ children, className, ...props }: GlassButtonProps) {
  return (
    <Button
      variant="outline"
      className={`bg-white/[0.08] text-white font-semibold px-8 py-3.5 rounded-[10px] h-auto border-white/[0.12] hover:bg-white/[0.14] transition-all ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
}
