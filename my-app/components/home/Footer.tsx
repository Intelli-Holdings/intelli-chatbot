import Meteors from "@/components/magicui/meteors";
import { Twitter, Facebook, Mail, Linkedin, Youtube, Instagram, Music } from 'lucide-react';
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FooterDemo() {
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = "mailto:support@intelliconcierge.com";
  };

  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Meteors number={30} />
      <div className="max-w-8xl mx-auto">
        
        {/* Middle section with contact and social links */}
        <div className="border-t border-b border-gray-700 py-8 flex justify-between items-center">
          <h2 className="text-4xl font-light">
            <a href="mailto:support@intelliconcierge.com" onClick={handleEmailClick} className="font-bold text-[#007fff]">
              Contact us.
            </a>           
          </h2>
          <div className="flex space-x-4">
            <Link href="https://www.linkedin.com/company/intelli-concierge">
              <Linkedin size={24} />     
            </Link>
                 
            <Link href="https://www.instagram.com/intelli_concierge/">
              <Instagram size={24} /> 
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="mailto:support@intelliconcierge.com" onClick={handleEmailClick}>
                    <Mail size={24} /> 
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>support@intelliconcierge.com</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Bottom section with logo and legal links */}
        <div className="mt-12">
          <h1 className="text-8xl pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-slate-300/80 bg-clip-text text-8xl font-extrabold leading-none text-transparent ">Intelli</h1>
          <div className="flex space-x-6 text-sm bg-gradient-to-b from-black to-slate-300/80 bg-clip-text text-center text-8xl font-extrabold leading-none ">
            <a href="/terms-of-service" className="hover:underline ">Terms of Use</a>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <span>©Intelli 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}