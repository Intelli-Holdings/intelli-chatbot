import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const caseStudies = [
  {
    logo: 'Proconnect Pay',
    color: 'bg-emerald-700',
    title: 'How Proconnect Pay Scaled to over 300+ Customer Slack Channels',
  },
  {
    logo: 'Global Conct',
    color: 'bg-blue-500',
    title: 'How Global Conct Scales Slack and Microsoft Teams Support',
  },
  {
    logo: 'Briden Travels',
    color: 'bg-gray-900',
    title: 'Briden Travels Unifies Support Across Slack Connect and In-App Chat',
  },
  {
    logo: 'Travel Abroad Ghana',
    color: 'bg-purple-600',
    title: 'Travel Abroad Ghana Unified Support Across Slack Connect, Community, Email, and Chat',
  },
];

const CaseStudy: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : caseStudies.length - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex < caseStudies.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">Learn from the best</h2>
          <div className="flex space-x-4">
            <button
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={handlePrev}
            >
              <ArrowLeft size={24} />
            </button>
            <button
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={handleNext}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* Grid with responsive utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-[400px]">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className={`${study.color} rounded-lg text-white p-4 transition-all duration-300 ease-in-out overflow-hidden
                          ${index === activeIndex ? 'opacity-100' : 'opacity-50'}`}
             
            >
              <div className="h-full flex flex-col justify-between">
                <div className="text-xl font-bold mb-4">{study.logo}</div>
                <p
                  className={`text-sm transition-all duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {study.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
            More case studies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudy;
