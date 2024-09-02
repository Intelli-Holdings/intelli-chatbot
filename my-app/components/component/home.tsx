import { Button } from "@/components/ui/button";
import FAQcomponent from '@/components/home/FAQcomponent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/navbar";
import {
  CardTitle,
  CardDescription,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Testimonals from "@/components/testimonial";
import Usecases from "@/components/home/usecases";

// image imports

import pinkImage from "@/public/pink.png";
import yellowImage from "@/public/yello.png";
import Pie from "@/public/piechart.png";

// Section and component imports

import { PreviewLanding } from "@/components/sections/preview-landing";
import SkewedInfiniteScroll from "@/components/skewed-scroll";
import AnimatedLogoCloud from "../logo-cloud";
import PricingSection from "@/components/component/pricing-component";
import CTASection from "./cta-section";

export function Home() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-16">
        <section className="container mx-auto mt-20 px-4">
          <p className="mt-4 text-center text-5xl font-bold text-blue-600 mb-8 bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Keep Your Customers Engaged, Effortlessly.
          </p>
          <p className="my-10 text-center text-lg font-bold font-medium text-gray-800">
            Send reminders, scheduled messages, and
            broadcast marketing campaigns at scale. From Whatsapp to Email, to
            website chatbots to anything you can think of – we got you covered.
          </p>
          <div className="flex justify-center mt-8 space-x-4">
            <a href="/auth/sign-up">
              <Button className="text-xl font-bold py-8 px-8 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-500">
                Get Started
              </Button>
            </a>
            <a
              href="https://calendly.com/sila-r0a9/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="text-xl font-bold py-8 px-8 bg-white text-blue-600 rounded-md shadow-lg hover:bg-gray-100 border border-blue-600">
                Book Demo
              </Button>
            </a>
          </div>

          <div className="mx-auto mt-10 px-4">
            <PreviewLanding />
          </div>
        </section>

        <section className="py-10 relative">
          <Image
            alt="Bg Pink"
            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-60 h-60 bg-cover bg-center filter blur-md z-0"
            style={{ backgroundImage: `url(${pinkImage})` }}
            src={pinkImage}
          />
          <div className="flex justify-center mb-4">
            <Badge>Use Cases</Badge>
          </div>
          <div className="container mx-auto">
            <h2 className="mb-1 text-center text-2xl font-semibold tracking-tighter text-4xl font-bold text-center text-blue-600">
              How Businesses Use Intelli
            </h2>
            <Usecases />
          </div>
        </section>
        <section className="py-12 ">
          <div className="container mx-auto px-4">
            <h2 className=" mb-1 text-center text-2xl font-semibold tracking-tighter text-4xl font-bold text-center text-blue-600">
              What Value Do You Get?
            </h2>
            <div className="container mx-auto sm:px-6 lg:px-8">
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="bg-white-100 border border-gray-200 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Manage your customer service efficiently, save time
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Streamline Support Processes for Swift Resolution
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Optimize Resources</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Utilize Advanced Algorithms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Integrate with existing tools and platforms</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white-100 border border-gray-200 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Optimize your operations by reducing expenses
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Cut down on manpower</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Reduce overhead costs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Minimize training expenses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Maintain high-quality service and reduce delays
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 rounded-xl p-4">
          <div className="container mx-auto px-2">
            <Testimonals />
          </div>
        </section>
        <PricingSection />        
        <CTASection />
        <FAQcomponent />
      </main>
    </div>
  );
}
