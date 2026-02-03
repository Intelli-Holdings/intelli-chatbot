import { Navbar } from "@/components/navbar"
import { ChatWidget } from "@/components/ChatWidget"
import { Badge } from "@/components/ui/badge"
//import { SocialMediaPreviews } from "@/components/social-media-previews"

export default function Company() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mt-20">
          <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Intelli: Innovation, Intelligence, and Impact
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              At Intelli, we are committed to revolutionizing customer support through AI-powered solutions. Our
              platform centralizes conversations across multiple channels, ensuring seamless communication and enhanced
              customer satisfaction.
            </p>
          </div>
        </section>
        {/* Mission and Vision */}
        <section className="container mt-20">
          <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Mission & Vision
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Our Mission and Vision
            </h2>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Intelli is dedicated to streamlining customer support by providing a centralized platform that
                  efficiently manages conversations across multiple channels and enhances overall satisfaction.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our vision is to be the go-to customer support solution for businesses, enabling seamless communication
                  and ensuring exceptional experiences through technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* G.L.O.W. Values */}
        <section className="container mt-20">
          <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4 text-yellow-600 border-yellow-200">
                Values
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Our Purpose
            </h2>
            <h3 className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 max-w-2xl mx-auto leading-relaxed font-semibold">
              G.L.O.W. Values
            </h3>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Good Vibes",
                  description:
                    "We cultivate an atmosphere of positivity, fun, and curiosity, creating a supportive environment where employees feel uplifted and motivated.",
                  icon: "😊",
                  gradient: "from-green-400 to-green-600",
                },
                {
                  title: "Leadership",
                  description:
                    "We lead by example, setting industry standards through innovation and empowering our team to take charge and succeed.",
                  icon: "👑",
                  gradient: "from-blue-400 to-blue-600",
                },
                {
                  title: "Oneness",
                  description:
                    "We believe in unity and collaboration, fostering a strong sense of teamwork and inclusivity among our employees and clients.",
                  icon: "🤝",
                  gradient: "from-teal-400 to-teal-600",
                },
                {
                  title: "Well-being",
                  description:
                    "We prioritize the well-being of our team, ensuring a balanced and fulfilling work environment that supports both personal and professional growth.",
                  icon: "🌱",
                  gradient: "from-teal-400 to-teal-600",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto`}
                  >
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="container mt-20">
          <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4 text-indigo-600 border-indigo-200">
                Careers
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Why Work With Us
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Life at Intelli
            </p>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Work That Matters",
                  description:
                    "At Intelli, you'll work on projects that make a real impact—helping businesses harness the power of AI to transform their operations. Whether you're passionate about AI, software development, or innovative technology, Intelli is the place to be.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Collaborative Culture",
                  description:
                    "Our culture is all about teamwork, innovation, and fun. We believe in a collaborative environment where everyone's voice is heard, and great ideas can come from anywhere. You'll find a diverse group of professionals all working together to solve some of the industry's toughest challenges.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Benefits That Support You",
                  description:
                    "We care about our employees' well-being, offering comprehensive benefits that support both your professional and personal growth. From health and wellness programs to professional development opportunities, Intelli ensures you have what you need to thrive.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Opportunities to Grow",
                  description:
                    "At Intelli, your career development is a priority. We offer numerous opportunities for learning and growth, from leadership development programs to cross-functional projects. We're committed to helping you reach your full potential.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  ),
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-teal-600 rounded-lg flex items-center justify-center text-white mr-4">
                      {benefit.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{benefit.title}</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connect With Us */}
        <section className="container mt-20">
          <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4 text-pink-600 border-pink-200">
                Connect
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Connect With Us
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Follow Our Journey
            </p>
          </div>
          <div className="container mx-auto sm:px-6 lg:px-8">

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                Stay connected with Intelli and follow our story as we continue to innovate and transform customer
                support. Join our community across social platforms to get the latest updates, insights, and
                behind-the-scenes content.
              </p>

              {/* Social Media Links */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a
                  href="https://www.linkedin.com/company/intelli-concierge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="font-semibold">LinkedIn</span>
                </a>

                <a
                  href="https://www.youtube.com/channel/UCJkapqlTXXLQiL6UBX54ECQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="font-semibold">YouTube</span>
                </a>

                <a
                  href="https://www.instagram.com/intelli_concierge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="font-semibold">Instagram</span>
                </a>
              </div>

              {/* Social Media Previews */}

            </div>
          </div>
        </section>
      </main>

      <ChatWidget />
    </div>
  )
}
