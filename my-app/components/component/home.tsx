import { Button } from "@/components/ui/button";
import FAQcomponent from "@/components/home/FAQcomponent";

import { Navbar } from "@/components/navbar";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Testimonals from "@/components/testimonial";


// Section and component imports

import { PreviewLanding } from "@/components/sections/preview-landing";
import HowItWorksSection from "@/components/home/howItworks";
import { BentoSection } from "@/components/home/bentoSection";
import { FooterComponent} from "@/components/home/Footer";

import ValueProposition from "@/components/ValueProposition";
import PlatformCards from "@/components/platform-cards";
import UsecaseComponent from "@/components/usecaseComponent";

export function Home() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <section className="container mt-20">
          <h1 className="mt-4 text-center text-5xl sm:text-6xl md:text-8xl font-extrabold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
              Engage clients in{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              seconds
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
              {" "}
              with AI
            </span>
          </h1>
          <p className="my-10 text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Intelli streamlines customer conversations for your business using
            AI across WhatsApp, website, and email.
          </p>
          
          <PreviewLanding />
         
          
    <div className="flex justify-center mt-10 mb-10">
            <a href="/auth/sign-up">
              <Button
                className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg 
                hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
                ring-1 ring-teal-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out pulse-animation"
              >
                Sign-up for Free
              </Button>
            </a>
          </div>
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
          <div className="container mx-auto sm:px-6 lg:px-8">
            <Testimonals />
          </div>
        </section>

        <section className="mb-10 mt-10">
          <div className="flex justify-center mb-4">
            <Badge>Use Cases</Badge>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">
            <UsecaseComponent />
          </div>
        </section>

        <section className="mb-10 mt-10">
        <div className="">
       <FAQcomponent />
       </div>
        </section>    
        <FooterComponent />
      </main>    
      
    </div>
  );
}
