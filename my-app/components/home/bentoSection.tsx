import { CalendarIcon, FileTextIcon, UpdateIcon } from "@radix-ui/react-icons";
import { ArrowDownRightFromCircle, ArrowUpToLineIcon, BellIcon, CircleDotIcon, LucideBellDot, MessageCircleCodeIcon, MessageSquareDashedIcon, MessageSquareDiffIcon, MoreHorizontalIcon, Share2Icon, TargetIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { AnimatedBeamDemo } from "@/components/magicui/animated-beam-demo";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import {AnimatedListDemo} from "@/components/magicui/animated-list-demo";

const Icons = {
  whatsapp: () => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="b"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
        <filter
          id="a"
          width="1.115"
          height="1.114"
          x="-.057"
          y="-.057"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3.531" />
        </filter>
      </defs>
      <path
        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
        fill="#b3b3b3"
        filter="url(#a)"
      />
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
        fill="url(#linearGradient1780)"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#b)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  ),
};

const files = [
  {
    name: "Reduce expenses",
    body: "✅ Cut down on manpower",

  },
  {
    name: "Optimize Resources",
    body: "✅ Reduce overhead costs",
  },
  {
    name: "Improve Service",
    body: "✅ Maintain high-quality service and reduce delays.",
  },
  {
    name: "Better Support",
    body: "✅ Streamline Support Processes for Swift Resolution.",
  },
  {
    name: "Save Time",
    body: "✅ Manage your customer service efficiently and save time.",
  },
];

const features = [
  {
    Icon: MoreHorizontalIcon,
    name: "Business Upgrades",
    description: "We help your business upgrade on the customer service.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium text-grey-500 ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: LucideBellDot,
    name: "Timely Notifications",
    description: "Get notified when a customer sends a time-sensitive message.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo 
      className="absolute h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Share2Icon,
    name: "Integrations",
    description: "We integrate with your favourite apps and so much more.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamDemo  className="absolute h-[300px] w-full right-0 top-10 origin-top rounded-md border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" /> 
      
    ),
  },
  {
    Icon: Icons.whatsapp,
    name: "WhatsApp Business Broadcast",
    description: "Send personalized messages, promotions, order updates or alerts to 2B+ WhatsApp users.",
    className: "col-span-3 lg:col-span-1",
    href: "/whatsapp-broadcast",
    cta: "try now",
    background: (
      <div className="absolute h-[300px] w-full border-none transition-all inset-0 flex flex-col items-center justify-center space-y-2 p-4 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 transition-all duration-300">
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Sending Broadcast...</span>
        </div>
        <div className="space-y-1 w-full max-w-[120px]">
          
          <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-[8px] text-green-800">
            ✓ 50% off sale alert; book now
          </div>
          <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-[8px] text-green-800">
            ✓ Hello #first-name; you are welcome to #business-name
          </div>
        </div>
        <div className="text-[10px] text-green-600 font-semibold">2M+ users reached</div>
      </div>
    ),
  },
  {
    Icon: MessageCircleCodeIcon,
    name: "WhatsApp Business API",
    description: "Unlock unlimited messaging, multiple devices, team collaboration, and integrate AI and advanced automation. Scale beyond the basic WhatsApp Business App.",
    href: "/whatsapp-api",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-3",
    background: (
      <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 transition-all duration-300">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-center items-center mb-4">
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">VS</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center p-2 bg-gray-100 rounded-lg">
              <h4 className="font-bold text-gray-800">Whatsapp Business App</h4>
              <p className="text-gray-600 text-[10px]">1 user, 256 broadcasts</p>
            </div>
            <div className="text-center p-2 bg-green-100 rounded-lg">
              <h4 className="font-bold text-green-800">Whatsapp Business API</h4>
              <p className="text-green-700 text-[10px]">Unlimited users & broadcasts</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-gray-700">Advanced AI automation</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-gray-700">Rich analytics & integrations</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function BentoSection() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
