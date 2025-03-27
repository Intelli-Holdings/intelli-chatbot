import { FC } from 'react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Bernard Addey Sackey',
    description:
      "Check out Intelli Concierge, the next big thing in customer support ? 🤔.",
    profession: 'Software Developer at Agriguard',
    image: '/bern.jpeg',
  },
 
  {
    name: 'Koffi Derek Addo',
    profession: 'CEO at Agriguard',
    description:
      "This is customer support but on steroids; I love to see the application of AI responsibly.",
    image: '/derek.jpeg',
  },
  {
    name: 'Andrews Ankomahene',
    profession: 'CTO at Radii',
    description:
      "I believe in the power of automating service delivery with a human touch, Intelli concierge gives us the ability to do just that with their solution.",
    image: '/andre.jpeg',
  },
  
  {
    name: 'Akweley Abena',
    profession: 'GDG Accra Partnerships Associate',
    description:
      "Intelli is already leaving their mark everywhere in the world.",
    image: '/acquel.jpeg',
  },
]
interface TestimonalCardProps {
  name: string
  description: string
  image: string
  profession: string
}

const TestimonialCard: FC<TestimonalCardProps> = ({
  name,
  description,
  image,
  profession,
}) => {
  return (
    <div
      className={`card-shadow dark:border-neutral-100 relative flex h-auto max-w-[22rem] select-none flex-col items-start justify-center overflow-hidden rounded-2xl border border-neutral-100 p-5 shadow-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-sm dark:border-neutral-800 dark:hover:shadow-white/10`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-2xl bg-gradient-to-r from-[#007fff]  to-[#68E4E6] opacity-20 blur-3xl"></div>
      <div className="mb-0 flex h-fit flex-row items-center gap-3">
        <Image
          className="m-0 block h-11 w-11 rounded-full object-cover"
          src={image}
          alt={image}
          width={120}
          height={80}
        />
        <div className="mb-0 flex h-fit flex-col items-start">
          <h3 className="m-0 text-base font-medium text-gray-500 dark:text-gray-900">
            {name}
          </h3>
          <p className="font-regular m-0 text-center text-sm text-gray-600 dark:text-gray-400">
            {profession}
          </p>
        </div>
      </div>
      <p className="mb-0 mt-3 text-left text-sm font-light text-gray-600 md:text-base dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

const Testimonals = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12">
      <h2 className="text-center text-5xl font-bold mb-10">
        Join 100+ Businesses on Intelli
      </h2>
      <p className="max-w-2xl text-center text-sm font-semibold md:text-base ">
        Intelli is loved and used by many companies. It is
        a great tool for businesses that intend to improve customer experience.
      </p>
      <div className="relative mt-12 flex h-full w-full flex-col items-center justify-center gap-5 md:flex-row">
        {[0, 1, 2].map((colIndex) => (
          <div key={colIndex} className="flex flex-col justify-center gap-4">
            {testimonials
              .slice(colIndex * 2, colIndex * 2 + 2)
              .map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonals
