import { Button } from "@/components/ui/button";
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
        <section className="container mx-auto mt-8 px-4">
       
          <p className="mt-4 text-center text-5xl font-bold text-blue-600 mb-8 bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Customer Support on Autopilot.
          </p>
          <p className="text-center text-lg font-bold font-medium text-gray-800">
            Improve customer experience by automating responses to frequently
            asked questions promptly.  
          </p>
          <div className="flex justify-center mt-8 space-x-4">
  <a href="/auth/sign-up">
    <Button className="text-xl font-bold py-8 px-8 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-500">
      Get Started
    </Button>
  </a>
  <a href="https://calendly.com/sila-r0a9/30min" target="_blank" rel="noopener noreferrer">
    <Button className="text-xl font-bold py-8 px-8 bg-white text-blue-600 rounded-md shadow-lg hover:bg-gray-200 border border-blue-600">
      Book Demo
    </Button>
  </a>
</div>


          <div className="mx-auto pt-10">
          <PreviewLanding />            
          </div>
          
        </section>
        <section className="bg-white-100 py-12 text-center shadow-lg rounded-xl border border-gray-200 shadow-md">
      <div className="container mx-auto px-4">
        <h2 className="mb-1 text-center text-2xl font-semibold tracking-tighter text-4xl font-bold text-center text-blue-600 ">
          Our techstack is top-notch
        </h2>
        <AnimatedLogoCloud  />
      </div>
    </section>

        <section className="py-12 relative">
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
            <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
              <Card className="bg-[#007fff] bg-opacity-35">
                <CardContent className="p-6 space-y-2 backdrop-blur-lg rounded-lg">
                  <div className="text-sm">
                    <CardTitle>Rich Monthly Insights:</CardTitle>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Receive rich insights from conversations with the assistant, human agent resolution time and customer satisfaction.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#ACD4FF] bg-opacity-85">
                <Image
                  alt="Swift AI Responses"
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cover bg-center filter blur-sm z-0"
                  style={{ backgroundImage: `url(${yellowImage})` }}
                  src={yellowImage}
                />
                <CardContent className="p-6 space-y-2 backdrop-blur-lg rounded-lg">
                  <div className="text-sm">
                    <CardTitle>Swift Responses to Inquiries:</CardTitle>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Promptly respond to customer questions on your website, whatsapp, facebook, Instagram and email inbox.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#027EFE] bg-opacity-60">
                <CardContent className="p-6 space-y-2 backdrop-blur-lg rounded-lg">
                  <div className="text-sm">
                    <CardTitle>Timely Escalation Management:</CardTitle>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Immediately get notifications and alerts when customers request time-sensitive information and assistance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 ">
          
        
          <div className="container mx-auto px-4">
            <h2 className=" mb-1 text-center text-2xl font-semibold tracking-tighter text-4xl font-bold text-center text-blue-600">
              What Value Do You Get?
            </h2>
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-white-100 border border-gray-200 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            Manage your customer service efficiently, save time
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Streamline Support Processes for Swift Resolution</span>
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
              <span>Maintain high-quality service and reduce delays</span>
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
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="mb-1 text-center text-2xl font-semibold tracking-tighter text-4xl font-bold text-center  text-blue-600">
              Questions Frequently Asked..
            </h2>
            
            <div className="mt-8 max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I have multiple employees on the same plan?</AccordionTrigger>
        <AccordionContent>
        Ofcourse, you can have multiple departments from front office to marketing and sales to social media even reservations join your team/organisation
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How is my usage calculated?</AccordionTrigger>
        <AccordionContent>
          Your usage is calculated based on the number of interactions of your customers with the assistant. This includes the number of messages sent and received.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What payment methods are allowed?</AccordionTrigger>
        <AccordionContent>
        We embrace the global nature of business and hence use Credit
                  cards, Mobile Money and Cash. If in the near future more payment methods are added,
                  we shall issue a statement informing you of the change.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
              
            </div>
            
          </div>
        </section>    
        <CTASection />        
      </main>
    </div>
  );
}
