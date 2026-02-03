import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
 
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, PauseCircle } from 'lucide-react';

const HelpBanner = () => {
  const slides = [
    {
      title: "Get help exactly when you need it",
      subtitle: "From shipping to returns, find answers to all of your questions.",
      buttonText: "Start here",
      imageUrl: "/api/placeholder/1200/600"
      // In a real app, you would use: "https://images.unsplash.com/photo-1573497491765-55d99a3c5f46?q=80&w=2070"
    },
    {
      title: "Track your orders with ease",
      subtitle: "Get real-time updates on your purchases.",
      buttonText: "Track now",
      imageUrl: "/api/placeholder/1200/600"
    },
    {
      title: "24/7 Customer support",
      subtitle: "Our team is ready to assist you anytime.",
      buttonText: "Contact us",
      imageUrl: "/api/placeholder/1200/600"
    },
    {
      title: "Browse our help center",
      subtitle: "Find detailed guides and frequently asked questions.",
      buttonText: "Explore",
      imageUrl: "/api/placeholder/1200/600"
    }
  ];

  return (
    <Carousel className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden">
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <div className="relative h-96 w-full">
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${slide.imageUrl})`,
                }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-center px-12 md:px-16 lg:px-24 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-base md:text-lg mb-8">{slide.subtitle}</p>
                <div>
                  <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6">
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Custom Navigation */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <CarouselPrevious className="relative h-8 w-8 rounded-full bg-white/30 hover:bg-white/50">
          <ChevronLeft className="h-5 w-5" />
        </CarouselPrevious>
        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/30 hover:bg-white/50 border-none text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/30 hover:bg-white/50 border-none text-white">
          <PauseCircle className="h-5 w-5" />
        </Button>
        <CarouselNext className="relative h-8 w-8 rounded-full bg-white/30 hover:bg-white/50">
          <ChevronRight className="h-5 w-5" />
        </CarouselNext>
      </div>
    </Carousel>
  );
};

export default HelpBanner;