import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react'; // Using lucide-react icons for navigation

const CaseStudiesSection = () => {
  const caseStudies = [
    {
      title: 'Hightouch',
      description: 'How Hightouch Scaled to over 300+ Customer Slack Channels',
      bgColor: 'bg-teal-700', // Tailwind color for the background
      textColor: 'text-white',
    },
    {
      title: 'OneSchema',
      description: 'How OneSchema Scales Slack and Microsoft Teams Support',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    {
      title: 'Vellum',
      description: 'Vellum Unifies Support Across Slack Connect and In-App Chat',
      bgColor: 'bg-black',
      textColor: 'text-white',
    },
    {
      title: 'Lightdash',
      description: 'Lightdash Unified Support Across Slack Connect, Community, Email, and Chat',
      bgColor: 'bg-purple-500',
      textColor: 'text-white',
    },
  ];

  return (
    <section className="text-black py-10">
      <div className="container mx-auto px-12">
        <h2 className="text-3xl font-bold mb-8">A sneakpeek into how our customers use Intelli</h2>
        <div className="relative">
          <div className="flex space-x-4">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className={`${study.bgColor} ${study.textColor} rounded-lg p-6 w-60 flex-shrink-0`}
              >
                <h3 className="text-lg font-semibold mb-4">{study.title}</h3>
                <p>{study.description}</p>
              </div>
            ))}
          </div>
          {/* Left and Right Arrow Controls */}
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white">
            <ArrowLeft size={24} />
          </button>
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white">
            <ArrowRight size={24} />
          </button>
        </div>
        <div className="mt-8">
          <button className="bg-transparent border border-dark text-black px-4 py-2 rounded-lg">
            More case studies
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
