import React from 'react';

import { Twitter, Facebook, Linkedin, Youtube, Instagram, Music } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-blue-400 to-teal-300 text-black shadow-md rounded-xl h-auto overflow-hidden px-8 py-12">
      <div className="max-w-8xl mx-auto">
     
        {/* Top section with links */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold mb-4">Intelli for Startups</h3>
          
          </div>
          
          <div>
          
          </div>
          <div>
          <h3 className="font-semibold mb-4">Intelli for Enterprise</h3>
          </div>
        </div>
        
        {/* Middle section with contact and social links */}
        <div className="border-t border-b border-gray-700 py-8 flex justify-between items-center">
          <h2 className="text-4xl font-light">
            <span className="font-normal underline text-[#007fff]">Contact us.</span>
          </h2>
          <div className="flex space-x-4">
            <Linkedin size={24} />            
            <Instagram size={24} />
            
          </div>
        </div>

        {/* Bottom section with logo and legal links */}
        <div className="mt-12">
          <h1 className="text-8xl pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-8xl font-extrabold leading-none text-transparent dark:from-white dark:to-orange-900/10">Intelli</h1>
          <div className="flex space-x-6 text-sm bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-extrabold leading-none  dark:from-white dark:to-white-900/10">
            <a href="/terms-of-service" className="hover:underline ">Terms of Use</a>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <span>©Intelli 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;