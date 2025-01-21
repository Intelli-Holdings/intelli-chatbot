"use client";

import React, { useState } from 'react';
import { RainbowButton } from "@/components/ui/rainbow-button";
import EnterpriseBookingModal from '@/components/EnterpriseBooking';

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice: string;
  description: string;
  features: string[];
  buttonText: string;
  isRecommended?: boolean;
  link: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  originalPrice,
  description,
  features,
  buttonText,
  isRecommended = false,
  link,
}) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const isEnterprise = title === 'Enterprise';

  const handleButtonClick = () => {
    if (isEnterprise) {
      setIsBookingModalOpen(true);
    } else {
      window.location.href = link;
    }
  };

  return (
    <div
      className={`relative border p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
        isRecommended ? 'border-2 border-green-500 bg-green-50 scale-105' : 'border-gray-200'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-block px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <div className="flex items-baseline mb-2">
        <span className="text-5xl font-bold">{price}</span>
        {originalPrice && (
          <span className="ml-2 text-sm line-through text-gray-500">{originalPrice}</span>
        )}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <span className="text-green-500 flex-shrink-0 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      {isEnterprise ? (
        <>
          <RainbowButton
            onClick={handleButtonClick}
            className="w-full flex justify-center items-center"
          >
            {buttonText}
          </RainbowButton>
          <EnterpriseBookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
          />
        </>
      ) : (
        <a
          href={link}
          className={`w-full block text-center py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
            isRecommended
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700'
              : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold shadow-md hover:shadow-lg hover:from-gray-900 hover:to-black'
          }`}
        >
          {buttonText}
        </a>
      )}
    </div>
  );
};

export default PricingCard;