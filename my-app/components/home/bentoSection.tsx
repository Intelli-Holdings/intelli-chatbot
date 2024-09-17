import { CalendarIcon, FileTextIcon, UpdateIcon } from "@radix-ui/react-icons";
import { ArrowDownRightFromCircle, ArrowUpToLineIcon, BellIcon, CircleDotIcon, LucideBellDot, MessageCircleCodeIcon, MessageSquareDashedIcon, MessageSquareDiffIcon, MoreHorizontalIcon, Share2Icon, TargetIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { AnimatedBeamDemo } from "@/components/magicui/animated-beam-demo";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import {AnimatedListDemo} from "@/components/magicui/animated-list-demo";

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
    description: "Supports 10+ integrations and counting.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamDemo  className="absolute h-[400px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" /> 
      
    ),
  },
  {
    Icon: MessageSquareDiffIcon,
    name: "Scheduled Messages",
    description: "Schedule important messages to be sent by a particular date.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
      />
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
