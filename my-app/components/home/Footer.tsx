import Meteors from "@/components/magicui/meteors";
import { Twitter, Facebook, Linkedin, Youtube, Instagram, Music, Mail } from 'lucide-react';
import Link from "next/link";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function FooterComponent() {
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "mailto:support@intelliconcierge.com";
  };

  return (
    <footer className="relative flex flex-col bg-white backdrop-blur-lg text-black py-8 px-4 border border-gray-200  rounded-3xl overflow-hidden shadow-md">
       <Meteors number={30} />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Section */}
        <div className="space-y-4 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Get In Touch</h3>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link href="mailto:support@intelliconcierge.com" target="_blank" className="hover:text-yellow-300 flex items-center gap-2">
                <Mail size={20} />
                <span>Send Us Mail</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>support@intelliconcierge.com</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Social Media Links */}
          <div className="flex justify-center sm:justify-start space-x-4">
            <Link href="https://www.instagram.com/intelli_concierge/" target="_blank" className="hover:text-pink-400">
              <Instagram size={20} />
            </Link>
            <Link href="https://www.linkedin.com/company/intelli-concierge/" target="_blank" className="hover:text-blue-600">
              <Linkedin size={20} />
            </Link>
            <Link href="https://www.youtube.com/@Intelli-Concierge/" target="_blank" className="hover:text-red-700">
            <Youtube size={20} /> 
            </Link>
          </div>
        </div>

        {/* Kenya Address */}
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Kenya Office</h3>
          <address className="not-italic text-sm sm:text-base">
            <p>Kaburu Drive, Pinetree Plaza</p>
            <p>P.O BOX 7353, 00100</p>
            <p>Nairobi</p>
            <p>Kenya</p>
          </address>
        </div>

        {/* USA Address */}
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">USA Office</h3>
          <address className="not-italic text-sm sm:text-base">
            <p>State of Delaware</p>
            <p>251 Little Falls Drive</p>
            <p>City of Wilmington, County of Newcastle</p>
            <p>Delaware 19808, USA</p>
          </address>
        </div>
      </div>

      {/* Bottom section with logo and legal links */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-3xl font-bold p-2">Intelli</div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link href="/terms-of-service" className="hover:text-yellow-500 text-base sm:text-lg">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-yellow-500 text-base sm:text-lg">Privacy Policy</Link>
            <span className="text-sm sm:text-base">Copyright © {new Date().getFullYear()} Intelli Holdings Inc</span>
          </div>
        </div>
      </div>
     
    </footer>
  );
}

export default FooterComponent;
