import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { FooterComponent } from "@/components/home/Footer";
import { CompanySidebarNav } from "@/components/company/CompanySidebarNav";

// AEO: JSON-LD structured data + accordion FAQ component
import { FAQPageJsonLd, HowToJsonLd } from "@/components/seo/JsonLd";
import { AeoFaqSection } from "@/components/seo/AeoFaqSection";

export const metadata: Metadata = {
  title: "About Intelli – AI Customer Engagement Platform by Intelli Holdings Inc.",
  description:
    "Intelli is an AI-powered customer engagement platform that automates support and sales across WhatsApp, website chat, and email. Learn about our mission, values, and how we serve governments, NGOs, universities, and enterprises.",
  keywords: [
    "Intelli",
    "Intelli Holdings Inc.",
    "AI customer support",
    "WhatsApp Business API",
    "customer engagement platform",
    "about Intelli",
    "company",
  ],
  openGraph: {
    title: "About Intelli – AI Customer Engagement by Intelli Holdings Inc.",
    description:
      "Learn about Intelli, the AI-powered customer engagement platform trusted by governments, NGOs, universities, and enterprises worldwide.",
    url: "https://intelliconcierge.com/company",
  },
};

/* ------------------------------------------------------------------ */
/* AEO FAQ data — used both for rendering AND for FAQPage JSON-LD      */
/* ------------------------------------------------------------------ */
const companyFaqs = [
  {
    question: "What is Intelli?",
    answer:
      "Intelli is an AI-powered  multi-channel customer engagement platform built by Intelli Holdings Inc. It automates customer support and sales conversations across WhatsApp, website chat, and email. Organizations use Intelli to respond to customers instantly, qualify leads, and reduce support costs without adding staff.",
  },
  {
    question: "How does Intelli use AI to improve customer support?",
    answer:
      "Intelli deploys custom AI assistants that are trained on your organization's data. These assistants answer customer questions in real time, 24/7, across WhatsApp and website chat. They handle routine inquiries, collect contact information, and escalate complex issues to human agents automatically.",
  },
  {
    question: "Which industries does Intelli serve?",
    answer:
      "Intelli serves governments, NGOs, universities, enterprises, and travel & hospitality organizations. Each sector benefits from automated citizen services, program outreach, student enrollment support, enterprise customer engagement, and booking assistance respectively.",
  },
  {
    question: "What channels does Intelli support?",
    answer:
      "Intelli supports WhatsApp Business API, website chat widgets, and email. All channels connect to a unified inbox so your team can manage every conversation from one dashboard. WhatsApp integration includes broadcast messaging, template management, and campaign analytics.",
  },
  {
    question: "Is there a free trial available for Intelli?",
    answer:
      "Yes. Intelli offers a 7-day free trial with no credit card required. During the trial you can create an AI assistant, connect a WhatsApp number or website widget, and test automated conversations with real customers.",
  },
];

/* ------------------------------------------------------------------ */
/* AEO HowTo steps — used for rendering AND HowTo JSON-LD             */
/* ------------------------------------------------------------------ */
const howToSteps = [
  {
    name: "Create an Intelli account",
    text: "Sign up at intelliconcierge.com with your email. No credit card required. Your 7-day free trial starts immediately.",
  },
  {
    name: "Build an AI assistant",
    text: "Upload your organization's documents, FAQs, or knowledge base. Intelli trains a custom AI assistant on your data within minutes.",
  },
  {
    name: "Connect a channel",
    text: "Add a WhatsApp Business API number or embed the website chat widget on your site. Both options take under 10 minutes to configure.",
  },
  {
    name: "Go live and engage customers",
    text: "Your AI assistant starts responding to customers instantly. Monitor conversations, view analytics, and let your team handle escalations from the unified dashboard.",
  },
];

/* ------------------------------------------------------------------ */
/* Sidebar navigation                                                  */
/* ------------------------------------------------------------------ */
const sidebarNav = [
  { id: "about", num: "01", label: "ABOUT", color: "#f97316" },
  { id: "mission-vision", num: "02", label: "MISSION & VISION", color: "#3b82f6" },
  { id: "getting-started", num: "03", label: "GETTING STARTED", color: "#10b981" },
  { id: "why-intelli", num: "04", label: "WHY INTELLI", color: "#8b5cf6" },
  { id: "values", num: "05", label: "VALUES", color: "#eab308" },
  { id: "careers", num: "06", label: "CAREERS", color: "#6366f1" },
  { id: "connect", num: "07", label: "CONNECT", color: "#ec4899" },
  { id: "faq", num: "08", label: "FAQ", color: "#1a1a1a" },
];

export default function Company() {
  return (
    <div className="relative">
      <Navbar />

      {/* AEO: Structured data for answer engines */}
      <FAQPageJsonLd faqs={companyFaqs} />
      <HowToJsonLd
        name="How to Set Up AI Customer Support with Intelli"
        description="Get started with Intelli's AI customer engagement platform in four steps. No coding required."
        steps={howToSteps}
      />

      <main className="pt-20">
        <section className="py-20 bg-white">
          <div className="container">
            <div className="flex gap-12 lg:gap-20">
              {/* ── Sticky sidebar nav with scroll-tracking ── */}
              <CompanySidebarNav items={sidebarNav} />

              {/* ── Main content ── */}
              <div className="flex-1 min-w-0">

                {/* ═══════════════════════════════════════════════════════ */}
                {/* ABOUT                                                  */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="about" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      About
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    Intelli: Innovation, Intelligence, and Impact
                  </h1>

                  {/* Description */}
                  <div className="flex gap-6 mb-6 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Intelli is an AI-powered customer engagement platform by
                      Intelli Holdings Inc. that automates support and sales
                      across WhatsApp, website chat, and email — helping
                      governments, NGOs, universities, and enterprises respond to
                      customers instantly.
                    </p>
                  </div>

                  <div className="flex gap-6 mb-8 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      02
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Intelli reduces response times from hours to seconds, cuts
                      support costs by up to 60%, and is trusted by organizations
                      worldwide. Unlike generic chatbots, Intelli&apos;s AI
                      assistants are trained on your organization&apos;s own
                      documents, FAQs, and knowledge base — giving accurate,
                      context-specific answers that reflect your brand.
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-4 mt-10">
                    <Link
                      href="/features"
                      className="inline-block px-6 py-3 text-sm font-semibold text-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff] hover:text-white transition-colors"
                    >
                      Explore features
                    </Link>
                    <Link
                      href="/usecases"
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                    >
                      Industry use cases →
                    </Link>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* MISSION & VISION                                       */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="mission-vision" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Mission & Vision
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    What drives us forward
                  </h2>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-[#1a1a1a]/[0.08]">
                    <div className="py-8 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:pr-8">
                      <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                        <span className="text-[#1a1a1a]/30 mr-1">1.</span>{" "}
                        Mission
                      </h3>
                      <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                        Intelli is dedicated to streamlining customer support by
                        providing a centralized platform that efficiently manages
                        conversations across multiple channels and enhances
                        overall satisfaction.
                      </p>
                    </div>
                    <div className="py-8 sm:pl-8">
                      <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                        <span className="text-[#1a1a1a]/30 mr-1">2.</span>{" "}
                        Vision
                      </h3>
                      <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                        Our vision is to be the go-to customer support solution
                        for businesses, enabling seamless communication and
                        ensuring exceptional experiences through technology.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* GETTING STARTED                                        */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="getting-started" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Getting Started
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    How do you get started with Intelli?
                  </h2>

                  {/* Description */}
                  <div className="flex gap-6 mb-14 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Set up AI-powered customer support in four steps. No
                      technical expertise required — most organizations are live
                      within 15 minutes.
                    </p>
                  </div>

                  {/* Steps grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-[#1a1a1a]/[0.08]">
                    {howToSteps.map((step, i) => (
                      <div
                        key={step.name}
                        className={`py-8 ${
                          i < howToSteps.length - 1
                            ? "lg:border-r border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                            : ""
                        } ${i > 0 ? "lg:pl-8" : ""} ${
                          i < howToSteps.length - 1 ? "lg:pr-8" : ""
                        }`}
                      >
                        <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                          <span className="text-[#1a1a1a]/30 mr-1">
                            {i + 1}.
                          </span>{" "}
                          {step.name}
                        </h3>
                        <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-4 mt-10">
                    <Link
                      href="/auth/sign-up"
                      className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                    >
                      Start free trial
                    </Link>
                    <Link
                      href="/features"
                      className="inline-block px-6 py-3 text-sm font-semibold text-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff] hover:text-white transition-colors"
                    >
                      See all features →
                    </Link>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* WHY INTELLI                                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="why-intelli" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Why Intelli
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    Why organizations choose Intelli over traditional help desks
                  </h2>

                  {/* Description blocks */}
                  <div className="flex gap-6 mb-6 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Traditional help desks require large teams and long
                      response times. Intelli&apos;s AI assistants respond
                      instantly, handle unlimited concurrent conversations, and
                      cost a fraction of human agents.{" "}
                      <Link
                        href="/blog/ai-support-vs-traditional-helpdesks"
                        className="text-[#1a1a1a] font-semibold underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                      >
                        Read our comparison
                      </Link>
                    </p>
                  </div>

                  <div className="flex gap-6 mb-6 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      02
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Intelli is purpose-built for governments, NGOs,
                      universities, travel &amp; hospitality, and enterprises.
                      Each industry benefits from tailored AI automation.{" "}
                      <Link
                        href="/usecases"
                        className="text-[#1a1a1a] font-semibold underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                      >
                        See detailed use cases →
                      </Link>
                    </p>
                  </div>

                  <div className="flex gap-6 mb-8 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      03
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Intelli reduces customer response times by up to 90%, cuts
                      support staffing costs by 60%, and increases lead
                      conversion rates.{" "}
                      <Link
                        href="/pricing"
                        className="text-[#1a1a1a] font-semibold underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                      >
                        See pricing plans
                      </Link>{" "}
                      starting at $15/month.
                    </p>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* VALUES                                                 */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="values" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Values
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-4">
                    Our G.L.O.W. values
                  </h2>

                  {/* Description */}
                  <div className="flex gap-6 mb-14 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Everything we do is guided by four core values that shape
                      our culture and define how we work together.
                    </p>
                  </div>

                  {/* Values grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-[#1a1a1a]/[0.08]">
                    {[
                      {
                        num: "1",
                        title: "Good Vibes",
                        description:
                          "We cultivate an atmosphere of positivity, fun, and curiosity, creating a supportive environment where employees feel uplifted and motivated.",
                      },
                      {
                        num: "2",
                        title: "Leadership",
                        description:
                          "We lead by example, setting industry standards through innovation and empowering our team to take charge and succeed.",
                      },
                      {
                        num: "3",
                        title: "Oneness",
                        description:
                          "We believe in unity and collaboration, fostering a strong sense of teamwork and inclusivity among our employees and clients.",
                      },
                      {
                        num: "4",
                        title: "Well-being",
                        description:
                          "We prioritize the well-being of our team, ensuring a balanced and fulfilling work environment that supports both personal and professional growth.",
                      },
                    ].map((value, i, arr) => (
                      <div
                        key={value.num}
                        className={`py-8 ${
                          i < arr.length - 1
                            ? "lg:border-r border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                            : ""
                        } ${i > 0 ? "lg:pl-8" : ""} ${
                          i < arr.length - 1 ? "lg:pr-8" : ""
                        }`}
                      >
                        <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                          <span className="text-[#1a1a1a]/30 mr-1">
                            {value.num}.
                          </span>{" "}
                          {value.title}
                        </h3>
                        <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                          {value.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* CAREERS                                                */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="careers" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Careers
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    Why work with us
                  </h2>

                  {/* Description */}
                  <div className="flex gap-6 mb-14 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Life at Intelli — where meaningful work meets a
                      collaborative culture that supports your growth.
                    </p>
                  </div>

                  {/* Benefits grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-[#1a1a1a]/[0.08]">
                    {[
                      {
                        num: "1",
                        title: "Work That Matters",
                        description:
                          "At Intelli, you\u2019ll work on projects that make a real impact \u2014 helping businesses harness the power of AI to transform their operations. Whether you\u2019re passionate about AI, software development, or innovative technology, Intelli is the place to be.",
                      },
                      {
                        num: "2",
                        title: "Collaborative Culture",
                        description:
                          "Our culture is all about teamwork, innovation, and fun. We believe in a collaborative environment where everyone\u2019s voice is heard, and great ideas can come from anywhere.",
                      },
                      {
                        num: "3",
                        title: "Benefits That Support You",
                        description:
                          "We care about our employees\u2019 well-being, offering comprehensive benefits that support both your professional and personal growth. From health and wellness programs to professional development opportunities.",
                      },
                      {
                        num: "4",
                        title: "Opportunities to Grow",
                        description:
                          "At Intelli, your career development is a priority. We offer numerous opportunities for learning and growth, from leadership development programs to cross-functional projects.",
                      },
                    ].map((benefit, i, arr) => (
                      <div
                        key={benefit.num}
                        className={`py-8 ${
                          i % 2 === 0
                            ? "sm:pr-8 sm:border-r border-[#1a1a1a]/[0.08]"
                            : "sm:pl-8"
                        } ${
                          i < arr.length - 2
                            ? "border-b border-[#1a1a1a]/[0.08]"
                            : i < arr.length - 1
                            ? "border-b sm:border-b-0 border-[#1a1a1a]/[0.08]"
                            : ""
                        }`}
                      >
                        <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                          <span className="text-[#1a1a1a]/30 mr-1">
                            {benefit.num}.
                          </span>{" "}
                          {benefit.title}
                        </h3>
                        <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* CONNECT                                                */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="connect" className="mb-24">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      Connect
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                    Connect with us
                  </h2>

                  {/* Description */}
                  <div className="flex gap-6 mb-14 max-w-[520px]">
                    <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                      01
                    </span>
                    <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                      Stay connected with Intelli and follow our story as we
                      continue to innovate and transform customer support. Join
                      our community across social platforms for the latest
                      updates, insights, and behind-the-scenes content.
                    </p>
                  </div>

                  {/* Social links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-[#1a1a1a]/[0.08]">
                    {[
                      {
                        name: "LinkedIn",
                        href: "https://www.linkedin.com/company/intelli-concierge",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        ),
                      },
                      {
                        name: "YouTube",
                        href: "https://www.youtube.com/channel/UCJkapqlTXXLQiL6UBX54ECQ",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        ),
                      },
                      {
                        name: "Instagram",
                        href: "https://www.instagram.com/intelli_concierge/",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        ),
                      },
                    ].map((social, i, arr) => (
                      <div
                        key={social.name}
                        className={`py-8 ${
                          i < arr.length - 1
                            ? "sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08]"
                            : ""
                        } ${i > 0 ? "sm:pl-8" : ""} ${
                          i < arr.length - 1 ? "sm:pr-8" : ""
                        }`}
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3"
                        >
                          <span className="text-[#1a1a1a]/40 group-hover:text-[#1a1a1a] transition-colors">
                            {social.icon}
                          </span>
                          <span className="text-[13px] font-semibold text-[#1a1a1a] underline underline-offset-2 decoration-[#1a1a1a]/20 group-hover:decoration-[#1a1a1a]/60 transition-colors">
                            {social.name}
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* FAQ                                                    */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div id="faq" className="mb-10">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      FAQ
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-14">
                    Frequently asked questions about Intelli
                  </h2>

                  {/* FAQ accordion */}
                  <AeoFaqSection faqs={companyFaqs} />

                  {/* Support link */}
                  <div className="mt-10">
                    <Link
                      href="/support"
                      className="text-[13px] font-semibold text-[#1a1a1a] underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                    >
                      View all FAQs and support resources →
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <FooterComponent />
      </main>

      <ChatWidget />
    </div>
  );
}
