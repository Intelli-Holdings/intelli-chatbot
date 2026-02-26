"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { GradientButton } from "./GradientButton";

interface NavChild {
  label: string;
  href: string;
  description: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

export function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Open menu"
        >
          <span className="w-5 h-0.5 bg-white/70 rounded-full" />
          <span className="w-5 h-0.5 bg-white/70 rounded-full" />
          <span className="w-3.5 h-0.5 bg-white/70 rounded-full" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-[#0f172a] border-l border-white/[0.06] p-0"
      >
        <div className="flex flex-col h-full pt-12 px-6 pb-6">
          <div className="flex-1 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenSection(
                          openSection === link.label ? null : link.label
                        )
                      }
                      className="w-full flex items-center justify-between text-sm font-medium text-white/70 hover:text-white py-3 px-2 rounded-lg transition-colors"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          openSection === link.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openSection === link.label && (
                      <div className="pl-4 space-y-0.5">
                        {link.children.map((child) => (
                          <SheetClose asChild key={child.label}>
                            <Link
                              href={child.href}
                              className="block text-sm text-white/50 hover:text-white py-2 px-2 rounded-lg transition-colors"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      className="block text-sm font-medium text-white/70 hover:text-white py-3 px-2 rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-8">
            <SheetClose asChild>
              <Link
                href="/auth/sign-in"
                className="block text-center text-sm font-medium text-white/70 hover:text-white py-3 rounded-lg border border-white/[0.08]"
              >
                Log in
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/demo" className="block">
                <GradientButton className="w-full text-sm">
                  Get a Demo
                </GradientButton>
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
