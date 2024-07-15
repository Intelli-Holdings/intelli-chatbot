import Image from 'next/image'

const logos = [
  {
    name: 'Vercel',
    src: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg',
  },
  {
    name: 'Nextjs',
    src: '/Nextjs-logo.svg.png',
  },
  {
    name: 'Shadcn UI',
    src: '/shadcn-ui.png',
  },
  {
    name: 'Django',
    src: '/django.png',
  },
  {
    name: 'mistral',
    src: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/tyos2ayezryjskox3wzs.svg',
  },
  {
    name: 'Microsoft Azure',
    src: '/Microsoft_Azure.png',
  },
  {
    name: 'OpenAI',
    src: '/OpenAI_Logo.jpeg',
  },
]

const AnimatedLogoCloud = () => {
  return (
    <div className="w-full py-12">
      <div className="mx-auto w-full px-4 md:px-8">
        <div
          className="group relative mt-6 flex gap-6 overflow-hidden p-2"
          style={{
            maskImage: 'linear-gradient(to left, transparent 0%, black 20%)',
          }}
        >
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 animate-logo-cloud flex-row justify-around gap-6"
              >
                {logos.map((logo, key) => (
                  <div key={key} className="h-10 w-28 px-2 relative">
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      layout="fill"
                      objectFit="contain"
                      className="brightness-0 hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AnimatedLogoCloud