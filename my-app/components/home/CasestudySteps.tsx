import React from 'react';
import SupportActionsDropdown from '../support-action';
import ChatbotExperience from '../chatbox';

const steps = [
  { number: '01', title: 'Proconnect Pay' },
  { number: '02', title: 'Global Conct' },
  { number: '03', title: 'Agriguard' },
  { number: '04', title: 'GTVET' },
  { number: '05', title: 'OBA Tours' },
  { number: '06', title: 'Mendiata Hotel' },
  { number: '07', title: 'Koppan Hospitality' },
  { number: '08', title: 'Travel Abroad Ghana' },
];

const CaseStudySteps = () => {
  return (
    <div>
                <h2 className="text-center text-5xl font-bold mb-10">
        Is Intelli For You?
      </h2>
      <SupportActionsDropdown />
      <ChatbotExperience />
    
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden rounded-xl">

      <div className="absolute w-64 h-64 rounded-full border-4 border-blue-600 flex items-center justify-center z-10">
        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-600">We Keep Businesses in Motion</h2>
          
        </div>
      </div>
      {steps.map((step, index) => {
        const animationDelay = `${index * -5}s`;
        
        return (
          <div
            key={step.number}
            className="absolute w-38 bg-white text-blue-600 p-3 rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-600 hover:text-white animate-revolve"
            style={{
              animationDelay,
            }}
          >
        
            <div className="text-sm">{step.title}</div>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes revolve {
          from {
            transform: rotate(0deg) translateX(250px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(250px) rotate(-360deg);
          }
        }
        .animate-revolve {
          animation: revolve 40s linear infinite;
        }
      `}</style>
    </div>
    </div>
  );
};

export default CaseStudySteps;