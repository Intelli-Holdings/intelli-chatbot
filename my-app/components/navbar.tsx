"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  {
    label: "Products",
    href: "#",
    subItems: [
      { label: "Whatsapp Assistant", href: "/whatsapp-assistant" },
    ],
  },
  {
    label: "Blog",
    href: "/medium-blog",
  },
  {
    label: "Company",
    href: "/company",
  },
];

export function Navbar() {
  const [activeItem, setActiveItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to track dropdown open/close
  const dropdownRef = useRef(null); // Ref for dropdown
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleNavigate = (href:any) => {
    if (router) {
      router.push(href);
      setDropdownOpen(false); // Close dropdown when navigating
    }
  };

  const handleClickOutside = (event:any) => {
    if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target)) {
      setDropdownOpen(false); // Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const NavContent = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-4' : 'items-center space-x-20'}`}>
      {navItems.map((item) => (
        <div key={item.label} className={`relative ${mobile ? 'w-full' : 'flex'}`}>
          <a
            className={`text-gray-600 hover:text-yellow-500 font-medium ${mobile ? 'block py-2' : ''}`}
            href={item.href}
            onClick={item.label === "Products" ? (e) => { e.preventDefault(); handleDropdownToggle(); } : () => handleNavigate(item.href)}
          >
            {item.label}
          </a>
          {dropdownOpen && item.label === "Products" && item.subItems && (
            <div ref={dropdownRef} className={`${mobile ? 'mt-2' : 'absolute top-full mt-2'} w-48 bg-white shadow-lg rounded-md`}>
              <div className="py-2">
                {item.subItems.map((subItem) => (
                  <a
                    key={subItem.label}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    href={subItem.href}
                    onClick={() => handleNavigate(subItem.href)}
                  >
                    {subItem.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <a
        className={`text-gray-600 hover:text-yellow-500 font-medium ${mobile ? 'block py-2' : ''}`}
        href="/pricing"
        onClick={() => handleNavigate("/pricing")}
      >
        Pricing
      </a>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white/10 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <a className="flex items-center" href="/">
            <Image alt="Intelli Concierge" className="h-8 w-8" src="/Intelli.svg" height={32} width={32} />
            <span className="ml-2 text-2xl font-bold text-gray-900">Intelli</span>
          </a>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col h-full">
                <div className="flex-1 py-4">
                  <NavContent mobile />
                </div>
                <div className="py-4">
                  <a
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-500 border border-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition duration-300"
                    href="/dashboard"
                  >
                    Get Started
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <>
            <NavContent />
            <div>
              <a
                className="px-4 py-2 text-sm font-medium text-blue-500 border border-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition duration-300"
                href="/dashboard"
              >
                Get Started
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
