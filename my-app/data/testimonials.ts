export interface Testimonial {
  id: number
  company: string
  logo: string
  logoColor?: string
  testimonial: string
  author?: {
    name: string
    title: string
    avatar: string
  }
  image?: string
  hasStory?: boolean
  size: 'small' | 'medium' | 'large'
}

export const testimonials: readonly Testimonial[] = [
  {
    id: 1,
    company: "Brex",
    logo: "🏢",
    testimonial:
      "Extend outperformed every solution we tested — other vendors, open source, and even foundation models. It now powers key document workflows across 30,000 customers, helping us build the most intelligent and modern financial platform out there.",
    author: {
      name: "Pedro Franceschi",
      title: "CEO",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "large",
  },
  {
    id: 2,
    company: "Vendr",
    logo: "V",
    logoColor: "text-purple-600",
    testimonial:
      "We did a bakeoff, and Extend had the best results of any solution on the market. It eliminates an entire class of engineering problems around accuracy that we don't want to worry about.",
    author: {
      name: "Matt Hodgson",
      title: "CTO",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=200&width=300",
    hasStory: true,
    size: "medium",
  },
  {
    id: 3,
    company: "Flatiron",
    logo: "🏥",
    testimonial:
      "We were able to replicate 6 months of work in 2 weeks (!) with Extend. We're now scaling this up across all 5 million people with cancer in our network, truly transforming our work against this disease.",
    author: {
      name: "George Ho",
      title: "Senior Machine Learning Scientist",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "medium",
  },
  {
    id: 4,
    company: "Checkr",
    logo: "✓",
    logoColor: "text-blue-500",
    testimonial:
      "Extend eliminates the ongoing maintenance cost of model tuning, scoring, evaluations, and more. We're able to focus on innovating on our core experience, instead of managing the infra.",
    author: {
      name: "Adam Litton",
      title: "Staff Software Engineer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "medium",
  },
  {
    id: 5,
    company: "Column Tax",
    logo: "📊",
    logoColor: "text-blue-600",
    testimonial:
      "Extend outperformed 15 other vendors, including all major providers, on real-world documents from our customers.",
    size: "small",
  },
  {
    id: 6,
    company: "HomeLight",
    logo: "🏠",
    testimonial:
      "Our goal was to speed up our manual document review, but after a month, we realized our team never made any edits. We actually removed the human from the loop entirely.",
    author: {
      name: "Mike Abner",
      title: "CTO",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "medium",
  },
  {
    id: 7,
    company: "Stripe",
    logo: "💳",
    logoColor: "text-indigo-600",
    testimonial:
      "Implementing Extend reduced our document processing time by 90%. The accuracy is incredible and it seamlessly integrates with our existing payment infrastructure.",
    author: {
      name: "Sarah Chen",
      title: "Head of Engineering",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "large",
  },
  {
    id: 8,
    company: "Notion",
    logo: "📝",
    logoColor: "text-gray-800",
    testimonial:
      "Extend helps us automatically categorize and extract insights from millions of user documents. It's like having a super-powered AI assistant for our content team.",
    author: {
      name: "Alex Rodriguez",
      title: "Product Manager",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "medium",
  },
  {
    id: 9,
    company: "Figma",
    logo: "🎨",
    logoColor: "text-purple-500",
    testimonial:
      "The design document analysis capabilities are game-changing. Extend understands our design specs better than most humans do.",
    author: {
      name: "Emma Thompson",
      title: "Design Systems Lead",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "small",
  },
  {
    id: 10,
    company: "Shopify",
    logo: "🛍️",
    logoColor: "text-green-600",
    testimonial:
      "Processing merchant documents at scale was our biggest bottleneck. Extend solved this overnight with 99.8% accuracy across 50+ document types.",
    author: {
      name: "David Kim",
      title: "VP of Operations",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "medium",
  },
  {
    id: 11,
    company: "Airbnb",
    logo: "🏡",
    logoColor: "text-red-500",
    testimonial:
      "Host verification documents from 220+ countries, all processed automatically. Extend handles the complexity so we can focus on creating magical travel experiences.",
    author: {
      name: "Maria Santos",
      title: "Trust & Safety Director",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "medium",
  },
  {
    id: 12,
    company: "Zoom",
    logo: "📹",
    logoColor: "text-blue-600",
    testimonial:
      "Meeting transcripts, contracts, compliance docs - Extend processes them all with incredible precision. It's revolutionized our document workflows.",
    author: {
      name: "James Wilson",
      title: "Senior Software Engineer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    size: "small",
  },
  {
    id: 13,
    company: "Slack",
    logo: "💬",
    logoColor: "text-purple-600",
    testimonial:
      "Customer support tickets with attachments used to be a nightmare. Now Extend automatically extracts and categorizes everything, making our team 10x more efficient.",
    author: {
      name: "Lisa Park",
      title: "Customer Success Manager",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "medium",
  },
  {
    id: 14,
    company: "GitHub",
    logo: "🐙",
    logoColor: "text-gray-900",
    testimonial:
      "Code documentation, issue reports, pull request descriptions - Extend understands developer content like no other solution we've tried.",
    size: "small",
  },
  {
    id: 15,
    company: "Spotify",
    logo: "🎵",
    logoColor: "text-green-500",
    testimonial:
      "Music licensing agreements are complex documents. Extend extracts key terms and conditions with 100% accuracy, saving our legal team hundreds of hours monthly.",
    author: {
      name: "Anna Johansson",
      title: "Legal Operations Lead",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    hasStory: true,
    size: "large",
  },
]

export default testimonials
