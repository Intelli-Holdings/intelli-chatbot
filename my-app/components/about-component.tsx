"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const IntelliAIWebsite = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  const slides = [
    {
      id: 1,
      title: "Introducing Eloi7",
      description: "Eloi7 is a large-scale video generative model capable of creating realistic visuals with natural, coherent motion. It has strong understanding of text instructions and can take image and video as input",
      buttonText: "Try Now in Dream Machine",
      background: "/hero-background.jpg" 
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Hero Section with Carousel */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-500 ease-in-out"
            style={{ 
              backgroundImage: `url(/api/placeholder/1920/1080)`,
              filter: 'brightness(0.7)' 
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 p-8 pb-16 w-full bg-gradient-to-t from-black/50">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">Introducing Eloi7</h1>
            <p className="text-lg text-white mb-8">
              Eloi7 is a large-scale video generative model capable of creating realistic visuals with natural, coherent motion. It has strong understanding of text instructions and can take image and video as input
            </p>
            <button 
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
              onClick={() => router.push('/dream-machine')}
            >
              Try Now in Dream Machine
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 text-white p-2 rounded-full"
          onClick={handlePrevSlide}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 text-white p-2 rounded-full"
          onClick={handleNextSlide}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <button
              key={index}
              className={`h-1 w-6 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-wrap">
          <div className="w-full lg:w-1/2 pr-8">
            <h2 className="text-5xl font-bold mb-8 leading-tight">
              Intelli&apos;s mission is to build multimodal general intelligence that can generate, understand, and operate in the physical world
            </h2>
            <Link href="/join-us">
              <button className="border border-black px-6 py-3 rounded-full hover:bg-black hover:text-white transition">
                Join us
              </button>
            </Link>
          </div>
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="relative">
              <div className="w-full h-64 bg-blue-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-blue-200 rounded-full" />
                </div>
              </div>
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-medium">AI for the next billion people will not look like LLMs. Computers won&apos;t be point and click. Tomorrow&apos;s systems will be creative, immersive, and multimodally interactive.</h3>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Text alone is not enough to get there.</h4>
                  <p>The current industry approach of scaling LLMs on limited text data has hit a wall. At Intelli we are doing foundational research and building systems that can train efficiently on rich multimodal data. This is the path to useful general intelligence.</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">We are training world models that jointly learn from video, audio, and language — similar to how the human brain learns.</h4>
                  <p>This will enable models to see, hear and reason about the world so they can effectively collaborate with us, help us communicate better, entertain us, and one day, operate alongside us in the real world.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-16 px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-6xl font-bold mb-8">Platform</h2>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2 pr-8">
              <h3 className="text-3xl font-bold mb-6">Foundations for a new era of creativity and human expression</h3>
            </div>
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-medium mb-2">Worldbuilding is the foundation of storytelling.</h4>
                  <p>AI that is able to understand context, intent, and imagination, and gives you the power to manipulate anything is the key to unlocking this new era of creative expression.</p>
                </div>
                
                <div>
                  <p>We are building powerful and collaborative products for creatives working on video across media, entertainment, marketing, and advertising industries. These products are built in concert with Intelli&apos;s intelligent multimodal video, audio and reasoning models and make rich and controllable worldbuilding accessible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dream Machine Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-1/2 p-8">
                <div className="mb-6">
                  <h3 className="text-3xl font-serif">Dream</h3>
                  <h3 className="text-3xl font-bold uppercase">MACHINE</h3>
                </div>
                
                <p className="mb-4">
                  Ideate, visualize, create videos, and share your dreams with the world, using our most powerful image and video AI models. Available now on iOS and the Web.
                </p>
                
                <a href="#" className="text-gray-600 hover:text-black">Learn more.</a>
                
                <div className="mt-8 flex space-x-4">
                  <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800">
                    Try Now
                  </button>
                  <button className="text-black px-6 py-2">
                    Get App
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative h-full min-h-64">
                  <img 
                    src="/dublin.jpg" 
                    alt="Dream Machine Interface" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-8 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Intelli API</h2>
          {/* API content would go here */}
          <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-1/2 p-8">
                <div className="mb-6">
                  <h3 className="text-3xl font-serif">Dream</h3>
                  <h3 className="text-3xl font-bold uppercase">MACHINE</h3>
                </div>
                
                <p className="mb-4">
                  Ideate, visualize, create videos, and share your dreams with the world, using our most powerful image and video AI models. Available now on iOS and the Web.
                </p>
                
                <a href="#" className="text-gray-600 hover:text-black">Learn more.</a>
                
                <div className="mt-8 flex space-x-4">
                  <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800">
                    Try Now
                  </button>
                  <button className="text-black px-6 py-2">
                    Get App
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative h-full min-h-64">
                  <img 
                    src="/dublin.jpg" 
                    alt="Dream Machine Interface" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default IntelliAIWebsite;