import Image from "next/image"

const logos = [
  {
    name: "Mest Africa",
    url: "/mestafrica_logo.jpeg",
  },
  {
    name: "ALX",
    url: "/alx.jpeg",
  },
  {
    name: "BestPrice Ghana",
    url: "/bestpricegh.jpg",
  },
  {
    name: "JA Ghana",
    url: "/JA.png",
  },
  {
    name: "Oracom Group",
    url: "/Oracom.jpeg",
  },
  {
    name: "RViBS",
    url: "/RVIBS.jpeg",
  },
  {
    name: "Building Bytes",
    url: "/buildingbytes_logo.jpeg",
  },
   {
    name: "thedsgnjunkies",
    url: "/thedsgnjunkies.png",
  },
    {
    name: "GoldTop Experince",
    url: "/goldtopexperience.png",
  },
    {
    name: "AKCS Technologies",
    url: "/akcs.png",
  },
]

const AnimatedLogoCloud = () => {
  return (
    <section className="w-full ">
      <div className="container mx-auto px-4">
        <div
          className="group relative flex gap-6 overflow-hidden"
          style={{
            maskImage: "",
          }}
        >
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="flex shrink-0 animate-logo-cloud flex-row justify-around gap-8">
                {logos.map((logo, key) => (
                  <Image
                    key={key}
                    src={logo.url || "/placeholder.svg"}
                    className="h-20 w-32 px-2 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                    alt={`${logo.name}`}
                    loading="lazy"
                    width={128}
                    height={128}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default AnimatedLogoCloud
