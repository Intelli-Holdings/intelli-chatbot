import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const PlatformCards = () => {
  const platforms = [
    { name: 'Facebook', src: '/facebook.png' },
    { name: 'Messenger', src: '/messenger.png' },
    { name: 'Whatsapp', src: '/whatsapp.png' },
    { name: 'Instagram', src: '/instagram.png' },
    { name: 'Email Inbox', src: '/email.png' },
    { name: 'Website', src: '/website-icon.png' }
  ];

  return (
    <div className="relative w-full bg-background">
      <div className="mt-20 grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
        {platforms.map(({ name, src }) => (
          <Card
            key={name}
            className="group hover:shadow-lg transition-shadow duration-200 p-4 md:p-6" // Added padding
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16">
                  <Image
                    alt={name}
                    width={40}
                    height={40}
                    src={src}
                    className="w-10 h-10" // Adjusted for smaller icon size
                  />
                </div>

                <h2 className="text-xl font-medium text-black-200 dark:text-black-900">
                  {name}
                </h2>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlatformCards;


const Src = {
  whatsapp: () => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="b"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#b)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  ),
  messenger: () => (
    <svg 
      width="100"
      height="100"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 800">
      <defs>
        <radialGradient id="a" cx="101.9" cy="809" r="1.1" gradientTransform="matrix(800 0 0 -800 -81386 648000)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#09f"/>
          <stop offset=".6" stopColor="#a033ff"/>
          <stop offset=".9" stopColor="#ff5280"/>
          <stop offset="1" stopColor="#ff7061"/>
        </radialGradient>
      </defs>
      <path fill="#09f" d="M400 0C174.7 0 0 165.1 0 388c0 116.6 47.8 217.4 125.6 287 6.5 5.8 10.5 14 10.7 22.8l2.2 71.2a32 32 0 0 0 44.9 28.3l79.4-35c6.7-3 14.3-3.5 21.4-1.6 36.5 10 75.3 15.4 115.8 15.4 225.3 0 400-165.1 400-388S625.3 0 400 0z"/>
      <path fill="#FFF" d="m159.8 501.5 117.5-186.4a60 60 0 0 1 86.8-16l93.5 70.1a24 24 0 0 0 28.9-.1l126.2-95.8c16.8-12.8 38.8 7.4 27.6 25.3L522.7 484.9a60 60 0 0 1-86.8 16l-93.5-70.1a24 24 0 0 0-28.9.1l-126.2 95.8c-16.8 12.8-38.8-7.3-27.5-25.2z"/>
    </svg>
  ),
  meta: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <linearGradient id="meta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0064E0"/>
        <stop offset="100%" stopColor="#0064E0"/>
      </linearGradient>
      <path fill="url(#meta-gradient)" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
    </svg>
  ),
  instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <defs>
        <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
};