"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GradientButton } from "./GradientButton";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  {
    label: "Platform",
    href: "/features",
    children: [
      { label: "Campaign Builder", href: "/features#campaigns", description: "Multi-channel broadcast campaigns" },
      { label: "AI Assistant", href: "/features#ai-assistant", description: "Train AI on your knowledge base" },
      { label: "Multi-Channel Inbox", href: "/features#inbox", description: "Unified conversation management" },
      { label: "Analytics", href: "/features#analytics", description: "Real-time performance insights" },
      { label: "Flow Builder", href: "/features#flows", description: "Visual conversation automation" },
      { label: "Commerce", href: "/features#commerce", description: "Sell through conversations" },
    ],
  },
  {
    label: "Resources",
    href: "/blog",
    children: [
      { label: "Blog", href: "/blog", description: "Insights and guides" },
      { label: "Customer Stories", href: "/customer-stories", description: "See how teams use Intelli" },
      { label: "Documentation", href: "/docs", description: "Technical guides and API docs" },
    ],
  },
  {
    label: "Solutions",
    href: "/usecases",
    children: [
      { label: "Small Business", href: "/usecases#enterprise", description: "Scale customer support affordably" },
      { label: "Enterprise", href: "/usecases#enterprise", description: "Enterprise-grade features and security" },
      { label: "Government & NGO", href: "/usecases#government", description: "Serve citizens and stakeholders" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/92 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dreamBlue to-cyan-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-white font-semibold text-lg">Intelli</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.children && setOpenDropdown(link.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3.5 py-2 rounded-lg inline-flex items-center gap-1"
              >
                {link.label}
                {link.children && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === link.label ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>

              {/* Dropdown */}
              {link.children && openDropdown === link.label && (
                <div className="absolute top-full left-0 pt-2 w-[280px]">
                  <div className="bg-[#0f172a] border border-white/[0.08] rounded-xl p-2 shadow-2xl">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="text-sm font-medium text-white/90">{child.label}</div>
                        <div className="text-xs text-white/40 mt-0.5">{child.description}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link href="/demo">
            <GradientButton className="text-sm px-5 py-2.5">
              Get a Demo
            </GradientButton>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <MobileMenu navLinks={navLinks} />
      </div>
    </nav>
  );
}
