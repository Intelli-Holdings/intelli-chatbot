import Image from "next/image"
import { Star } from "lucide-react"

export default function TestimonialSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First testimonial with image */}
        <div className="bg-neutral-50 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="relative h-[250px] w-full">
            <Image src="/placeholder.svg?height=250&width=400" alt="Person using Crisp" fill className="object-cover" />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                E
              </div>
              <span className="text-sm font-medium">Emma</span>
            </div>
          </div>
        </div>

        {/* Second testimonial with profile and text */}
        <div className="bg-white rounded-2xl p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=50&width=50"
                alt="Edoardo Moreni"
                width={50}
                height={50}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Edoardo Moreni</h3>
              <p className="text-gray-500 text-sm">Emma</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We chose Crisp from the begining because of its flexibility and level of automations it allowed.
          </p>
        </div>

        {/* Third testimonial with rating */}
        <div className="bg-white rounded-2xl p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <div className="flex text-orange-500">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            What I really like in Crisp is the level of reliability of the service, the overall interface & interface
            speed, the fact that it&apos;s much more than just customer messaging, there are a galaxy of addons (mostly free
            of extra charges) really useful.
          </p>
        </div>

        {/* Fourth testimonial with rating and text */}
        <div className="bg-white rounded-2xl p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <div className="flex text-orange-500">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We are able to measure and manage all mediums effectively and increase customer satisfaction and resolution
            time drastically compared to previous solutions we used like Intercom and Zendesk.
          </p>
        </div>

        {/* Fifth testimonial with quote */}
        <div className="bg-white rounded-2xl p-8 shadow-sm transition-all hover:shadow-md border border-gray-100 flex items-center">
          <div className="space-y-4">
            <div className="text-gray-200 text-6xl">&quot;</div>
            <p className="text-gray-600 italic leading-relaxed text-center">
              All is ready to use &quot;out of the box&quot; and Crisp support is stellar... We have tried many other solutions,
              Crisp is the only one that allowed us to do everything easily within the same app.
            </p>
          </div>
        </div>

        {/* Sixth testimonial with image */}
        <div className="bg-neutral-50 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="relative h-[250px] w-full">
            <Image src="/placeholder.svg?height=250&width=400" alt="Person using Crisp" fill className="object-cover" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                R
              </div>
              <span className="text-sm font-medium">Reedsy</span>
            </div>
          </div>
        </div>

        {/* Seventh testimonial with profile */}
        <div className="bg-white rounded-2xl p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=50&width=50"
                alt="Chris Sees"
                width={50}
                height={50}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chris Sees</h3>
              <p className="text-gray-500 text-sm">Hoxton Mix</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

