import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import Testimonials from "@/components/testimonial";

// Section and component imports
import { PreviewLanding } from "@/components/sections/preview-landing";
import HowItWorksSection from "@/components/home/howItworks";
import { BentoSection } from "@/components/home/bentoSection";
import { FooterComponent } from "@/components/home/Footer";

import ValueProposition from "@/components/ValueProposition";
import PlatformCards from "@/components/platform-cards";
import UsecaseComponent from "@/components/usecaseComponent";
import Banner from "../signup-banner";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function Home() {
  const actions = ["Convert leads", "Engage clients", "Close sales"];
  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActionIndex((prev) => (prev + 1) % actions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [actions.length]);

  const onSignUpClick = useCallback(() => {
    if (window.fbq) {
      window.fbq("track", "Lead", { cta: "home_sign_up" });
    }
  }, []);

  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <section className="container mt-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="mt-4 text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
              <div className="relative w-full overflow-visible" style={{ height: '2.2em', minHeight: '1.2em' }}>
                {actions.map((action, index) => (
                  <span
                    key={action}
                    className={`absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-700 ease-in-out ${
                      index === currentActionIndex
                        ? 'opacity-100 translate-y-0'
                        : index < currentActionIndex
                        ? 'opacity-0 -translate-y-8'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {action}
                  </span>
                ))}
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                in seconds
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
                with AI
              </span>
            </h1>

            <p className="mt-6 text-center text-lg sm:text-xl md:text-2xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed">
              Intelli streamlines customer engagement using AI for your business across WhatsApp, website, and email.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-16 justify-center">
              <Link href="/auth/sign-up" onClick={onSignUpClick}>
                <Button className="w-full sm:w-auto text-base sm:text-lg font-bold py-6 px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right ring-1 ring-teal-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out">
                  Get Started
                </Button>
              </Link>

              <Link href="/dashboard/assistants">
                <Button variant="ghost" className="w-full sm:w-auto text-base sm:text-lg font-bold py-6 px-8  text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 ease-in-out">
                  Build your Assistant →
                </Button>
              </Link>
            </div>
          </div>

          <PreviewLanding />
        </section>

        <section className="container mt-20">
          <HowItWorksSection />
        </section>

        <section className="container mt-20">
          <ValueProposition />
        </section>

        <section className="">
          <div className="flex justify-center mb-4">
            <Badge>Platforms</Badge>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">
            <h2 className="text-center text-5xl font-bold mb-10">
              Intelli works on these platforms
            </h2>
            <PlatformCards />

            <div className="flex justify-center mt-10 mb-10 space-x-4">
              <a href="/auth/sign-up">
                <Button
                  className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg 
                hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
                ring-1 ring-teal-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out pulse-animation"
                >
                  Explore Platforms
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="">
          <div className="flex justify-center mb-4">
            <Badge>Benefits</Badge>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8 ">
            <h2 className="text-center text-5xl font-bold mb-10">
              Let&lsquo;s talk about what you gain
            </h2>
            <div className="mt-10">
              <BentoSection />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex justify-center mb-4">
            <Badge>Testimonials</Badge>
          </div>

          <div className="container mx-auto sm:px-6 lg:px-8 p-2">
            <Testimonials />
          </div>
        </section>

        <section className="mb-10 mt-10">
          <div className="flex justify-center mb-4">
            <Badge>Industries</Badge>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">
            <UsecaseComponent />
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8 p-2">
            <Banner />
          </div>
        </section>

        <section className="mb-10 mt-10">
          <div className=""></div>
        </section>
        <FooterComponent />
      </main>
    </div>
  );
}
