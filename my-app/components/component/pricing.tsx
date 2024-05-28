"use client";
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from "@/components/navbar"

const pricingPlans = [
  {
    name: 'Basic',
    description: 'Start with the essential tools to boost your customer experience.',
    monthlyPrice: 40,
    annualPrice: 480,
    link: 'https://paystack.com/pay/gnhtnpaxpg',
    features: [
      'Elli Website Chatbot',
      'Integrate with META platforms( FB, IG, WA)',
      'Reservations Booking engine integration',

    ],
  },
  {
    name: 'Premium',
    description:
      'Unlock enhanced features to supercharge your customer service.',
    monthlyPrice: 80,
    annualPrice: 960,
    link: 'https://paystack.com/pay/qc6a1bvrpu',
    features: [
      'Everything in Basic plan',
      'Integrate with Email',
      'View conversation history',
      'Integrate with Hotel management platforms',
      'Integrate with CRM platforms',
    ],
  },
  {
    name: 'Enterprise',
    description:
      'Everything we have to offer for ultimate customization for enterprises.',
    monthlyPrice: null,
    annualPrice: 10000,
    link: 'https://paystack.com/pay/s1j1m9987s',
    features: [
      'Everything in Premium plan',
      'AI Voice Agent',
      'Email assistant',
      'White-labeling & custom branding',
      'Dedicated account manager',
      '24/7 priority support',
      'Cloud hosting & security'
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
          Accessible pricing, Great Value.
        </p>
        <p className="text-md max-w-xl text-gray-700 md:text-center ">
          Get started with Intelli today and take your business to the next level.
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
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

