import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PreviewLanding } from "@/components/sections/preview-landing";

const headingOptions = [
  "Engage clients in ",
  "Automate support in ",
  "Generate leads in ",
  "Engage customers in "
];

const DynamicHeadingSection = () => {
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadingIndex((prevIndex) => (prevIndex + 1) % headingOptions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="">
      <h1 className="mt-4 text-center text-5xl sm:text-6xl md:text-8xl font-extrabold overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentHeadingIndex}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 12
            }}
            className="text-transparent p-2 bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 inline-block"
          >
            {headingOptions[currentHeadingIndex]}{" "}
          </motion.span>
        </AnimatePresence>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
           seconds
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
           {" "} with AI
        </span>
      </h1>
      
      <motion.p 
        className="my-10 text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 14,
          delay: 0.3
        }}
      >
        Intelli streamlines customer conversations for your business using
        AI across WhatsApp, website, and email.
      </motion.p>
      
      <PreviewLanding />
      
      <motion.div 
        className="flex justify-center mt-10 mb-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.6
        }}
      >
        <a href="/auth/sign-up">
          <Button
            className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg 
            hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
            ring-1 ring-teal-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out"
          >
            <motion.span
              animate={{ 
                boxShadow: [
                  "0px 0px 0px 0px rgba(56, 189, 248, 0.4)",
                  "0px 0px 20px 10px rgba(56, 189, 248, 0.4)",
                  "0px 0px 0px 0px rgba(56, 189, 248, 0.4)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              Sign-up for Free
            </motion.span>
          </Button>
        </a>
      </motion.div>
    </section>
  );
};

export default DynamicHeadingSection;