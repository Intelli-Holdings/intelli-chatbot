"use client";

import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice: string;
  description: string;
  features: string[];
  buttonText: string;
  isRecommended?: boolean;
  link: string; // New prop for the link URL
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  originalPrice,
  description,
  features,
  buttonText,
  isRecommended = false,
  link, // Accept the link as a prop
}) => {
  return (
    <div
      className={`border p-6 rounded-lg shadow-md hover:shadow-lg transition-all ${
        isRecommended ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}
    >
      {isRecommended && (
        <span className="inline-block mb-3 px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
          Recommended
        </span>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline">
        <span className="text-4xl font-bold">{price}</span>
        <span className="ml-2 text-sm line-through text-gray-500">{originalPrice}</span>
      </div>
      <p className="mt-4 mb-6 text-gray-600">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-green-500">&#10003;</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={link} // Use the link prop
        className="w-full block text-center py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default PricingCard;
