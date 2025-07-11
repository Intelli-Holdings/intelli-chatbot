import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, BarChart2, ListTodo, Share2, InboxIcon, Coins, PiggyBank, PiggyBankIcon } from 'lucide-react';
import { FaMoneyBillWaveAlt } from 'react-icons/fa';

interface FeedbackFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  content: {
    title: string;
    description: string;
    features: string[];
  };
}

const feedbackFeatures: FeedbackFeature[] = [
  {
    id: 'collect',
    title: 'Collect messages',
    description: 'Collect and organize all customer messages in the Intelli dashboard',
    icon: <InboxIcon className="w-6 h-6" />,
    image: '/organise.png',
    content: {
      title: 'Organize customer messages',
      description: 'Gather all your customer messages in one place for easy access.',
      features: [
        'Centralize customer chats from multiple channels',
        'Automatically categorize and respond to messages',
        'Reply to customer messages on time',
      ],
    },
  },
  {
    id: 'analyze',
    title: 'Gather insights',
    description: 'Uncover valuable insights from conversations with customers',
    icon: <BarChart2 className="w-6 h-6" />,
    image: '/Channels Dashboard.png',
    content: {
      title: 'Understand customer messages',
      description: 'Turn chats into actionable insights with data.',
      features: [
        'Generate reports from conversations',
        'Receive customer sentiment analysis',
        'Identify escalation resolution times',
      ],
    },
  },
  {
    id: 'prioritize',
    title: 'Prioritize responses',
    description: 'Attend to time sensitive messages from customers immediately.',
    icon: <ListTodo className="w-6 h-6" />,
    image: '/Escalations.png',
    content: {
      title: 'Prioritize escalated messages',
      description: 'Receive an alert when your customers need your help.',
      features: [
        'Create custom alerts and triggers for escalations',
        'Improve the efficiency of your customer support team',
        'Track escalation resolution times',
      ],
    },
  },
  {
    id: 'share',
    title: 'Save money',
    description: 'Maintain the profitablity in your business by reducing on expenses',
    icon: <FaMoneyBillWaveAlt className="w-6 h-6" />,
    image: '/Save.jpg',
    content: {
      title: 'Save more money',
      description: 'Keep your business afloat by automating customer support and ensure your customers are happy.',
      features: [
        'Maintain a positive brand image',
        'Redeem time spent hiring and firing new staff',
        'Save on spending on employee orientations',
      ],
    },
  },
];

const ValueProposition = () => {
  const [selectedFeature, setSelectedFeature] = React.useState<string>(feedbackFeatures[0].id);

  const selectedContent = feedbackFeatures.find(feature => feature.id === selectedFeature);

  if (!selectedContent) {
    return null;
  }

  return (
    <section className=" mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-10">
          Effortless customer support
        </h2>
        <p className="text-gray-600">
          Organize all your customer messages in one place, and keep every customer satisfied.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {feedbackFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setSelectedFeature(feature.id)}
            className={`p-6 rounded-lg text-left transition-all duration-200 hover:shadow-lg  flex flex-col items-center
              ${selectedFeature === feature.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white shadow hover:bg-gray-50'
              }`}
          >
            <div className={`mb-4 flex items-center justify-center ${selectedFeature === feature.id ? 'text-white' : 'text-teal-600'} `}>
              {feature.icon}
            </div>
            <h3 className={`font-semibold mb-2 hidden sm:block`}>
              {feature.title}
            </h3>
            <p className={`text-sm hidden sm:block ${selectedFeature === feature.id ? 'text-blue-100' : 'text-gray-600'}`}>
              {feature.description}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8"
          >
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">{selectedContent.content.title}</h3>
                <p className="text-gray-600">{selectedContent.content.description}</p>
                <ul className="space-y-4">
                  {selectedContent.content.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <img
                  src={selectedContent.image}
                  alt={selectedContent.title}
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ValueProposition;