"use client";
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from "@/components/navbar"

const pricingPlans = [
  {
    name: 'Website Widget',
    description: 'Convert more visitors that come to your website into paying customers. ',
    monthlyPrice: 8,
    annualPrice: 96,
    link: 'https://paystack.com/pay/qc6a1bvrpu',
    features: [
      'Elli Website Chatbot',
      'Integrate with any website(Wordpress, Wix, etc.)',
      'Dashboard to manage conversations',
      'Unlimited conversations',

    ],
  },
  {
    name: 'Whatsapp Assistant',
    description:
      'Never miss a sales opportunity by delivering instant responses to your customers on WhatsApp.',
    monthlyPrice: 20,
    annualPrice: 240,
    link: 'https://paystack.com/pay/gnhtnpaxpg',
    features: [
      'An AI-powered WhatsApp assistant',
      'Automated responses',
      'Takeover by human support staff',
      'Sentiment analysis of customer messages',
      'Dashboard to manage conversations',
    ],
  },
  {
    name: 'Custom',
    description:
      'If you have a large customer base and need a custom solution, this plan is for you.',
    monthlyPrice: null,
    annualPrice: null,
    link: 'https://cal.com/intelli/entreprise-sales',
    features: [
      'Custom AI assistant',
      'Custom integrations',
      'Dedicated support',
      'Unlimited conversations',
    ],
  },
]

export function Pricing () {
  const [billingCycle, setBillingCycle] = useState<'M' | 'A'>('M')

  const Heading = () => (
    <div className="container mx-auto px-4 z-10 my-12 flex flex-col items-center justify-center gap-4 p-4">
       <Navbar />  
      <div className="flex w-full flex-col items-start justify-center space-y-4 md:items-center">
        <div className="mb-2 inline-block rounded-full bg-blue-100 px-2 py-[0.20rem] text-xs font-medium uppercase text-blue-500">
          {' '}
          Pricing
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
          Scalable Pricing That Grows With Your Business.
        </p>
        <p className="text-md max-w-xl text-gray-700 md:text-center ">
          Get Started Today.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingCycle('M')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            billingCycle === 'M'
              ? 'relative bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-blue-100'
          }`}
        >
          Monthly
          {billingCycle === 'M' && <BackgroundShift shiftKey="monthly" />}
        </button>
        <button
          onClick={() => setBillingCycle('A')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            billingCycle === 'A'
              ? 'relative bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-blue-100'
          }`}
        >
          Annual
          {billingCycle === 'A' && <BackgroundShift shiftKey="annual" />}
        </button>
      </div>
    </div>
  )

  const PricingCards = () => (
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {pricingPlans.map((plan, index) => (
        <div
          key={index}
          className="w-full rounded-xl border-[1px] border-gray-300 bg-white p-6 text-left"
        >
          <p className="mb-1 mt-0 text-2xl font-medium uppercase text-blue-500">
            {plan.name}
          </p>
          <p className="my-0 mb-6 text-sm text-gray-600">{plan.description}</p>
          <div className="mb-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={billingCycle === 'M' ? 'monthly' : 'annual'}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="my-0 text-3xl font-semibold text-gray-900"
              >
                <span>
                  ${billingCycle === 'M' ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className="text-sm font-medium">
                  /{billingCycle === 'M' ? 'month' : 'year'}
                </span>
              </motion.p>
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                window.open(plan.link)
              }}
              className="mt-8 w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-500/90"
            >
              Subscribe to Plan
            </motion.button>
          </div>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="mb-3 flex items-center gap-2">
              <Check className="text-green-500" size={18} />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section className="relative w-full overflow-hidden bg-white py-12 text-black lg:px-2 lg:py-12">
      <Heading />
      <PricingCards />
    </section>
  )
}

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
  <motion.span
    key={shiftKey}
    layoutId="bg-shift"
    className="absolute inset-0 -z-10 rounded-lg bg-blue-500"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
  />
)

