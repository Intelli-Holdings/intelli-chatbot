import Link from "next/link";
import React from "react";
import { ChatPreview } from "../chat-preview";
import { ChatWindow } from "../chat-window";
import Image from "next/image";

const UseCaseSection = () => {
  return (
    <div>
      <h2 className="text-center text-5xl font-bold mb-10">
        Usecases for Intelli
      </h2>
      <section className="bg-gray-10 py-16 border border-gray-100 rounded-xl">
        <div className="container mx-auto px-2 md:px-8 ">
           {/* Card 1: Travel Agencies  */}
           <div className="bg-gray-10 py-16 border border-gray-100 mt-10 rounded-lg  p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Travel & Hospitality
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Travel & Hospitality</h2>
                  <p className="text-gray-700">
                    <strong>Use case:</strong>
                    <br />
                    Travel and hospitality brands rely on fast responses and personalized engagement to win bookings. Intelli helps capture traveler demand and convert inquiries into bookings using WhatsApp as a high-conversion marketing channel.
                  </p>
                  <p className="text-gray-700">
                    <strong>Increase bookings and revenue</strong>
                    <br />
                    Turn trip inquiries into confirmed bookings with automated discovery, follow-ups, and booking assistance that keeps travelers engaged until checkout.
                  </p>
                  <p className="text-gray-700">
                    <strong>Recover abandoned journeys</strong>
                    <br />
                    Re-engage travelers who drop off mid-conversation with timely reminders, offers, and updates that bring them back to complete their bookings.
                  </p>
                  <p className="text-gray-700">
                    <strong>Market globally, support locally</strong>
                    <br />
                    Promote destinations, offers, and experiences to travelers across regions and languages while scaling engagement without scaling teams.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Get Started 
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}

                
                  <Image
                    src="/travel-agent.avif"
                    alt="Travel image"
                    width={600} // Specify the width
                    height={600} // Specify the height
                    className="w-auto h-auto object-cover border rounded-lg" // Ensure responsiveness
                  />
               
              </div>
            </div>
          </div>

          {/* Card 2: NGO Section */}
          <div className="bg-gray-10 py-16 border border-gray-100 mt-10 rounded-lg p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      NGOs & Non-Profits
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold">NGOs & Non-Profits</h3>
                  <p className="text-gray-700">
                    <strong>Use case:</strong>
                    <br />
                    NGOs run large-scale recruitment and program campaigns that depend on awareness, outreach, and participation. Intelli helps market programs, capture applicants, and guide them through completion using WhatsApp automation.
                  </p>
                  <p className="text-gray-700">
                    <strong>Increase program participation</strong>
                    <br />
                    Promote opportunities, grants, and programs through direct messaging that reaches audiences instantly and drives higher application rates.
                  </p>
                  <p className="text-gray-700">
                    <strong>Improve applicant conversion</strong>
                    <br />
                    Guide applicants step by step with reminders, updates, and follow-ups that reduce abandonment and increase successful submissions.
                  </p>
                  <p className="text-gray-700">
                    <strong>Scale outreach without higher costs</strong>
                    <br />
                    Engage thousands of applicants and beneficiaries at once while keeping communication personal, consistent, and measurable.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Sign Up
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}
                <Image
                    src="/arclight.jpg"
                    alt="Travel image"
                    width={600} // Specify the width
                    height={600} // Specify the height
                    className="w-full h-auto object-cover rounded-lg" // Ensure responsiveness
                  />
                
              </div>
            </div>
          </div>

          {/* Card 3: Schools Section */}
          <div className="bg-gray-10 py-16 border border-gray-100 mt-10 rounded-lg p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Education & EdTech
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Education & EdTech</h2>
                  <p className="text-gray-700">
                    <strong>Use case:</strong>
                    <br />
                    Educational institutions compete for student attention while managing high inquiry volumes across digital channels. Intelli helps attract prospects, capture leads, and convert student interest into enrollments through automated WhatsApp engagement.
                  </p>
                  <p className="text-gray-700">
                    <strong>Drive more enrollments</strong>
                    <br />
                    Capture and nurture prospective students at the moment of intent with guided conversations, follow-ups, and reminders that reduce drop-offs and increase admissions.
                  </p>
                  <p className="text-gray-700">
                    <strong>Admissions marketing on autopilot</strong>
                    <br />
                    Run always-on admissions journeys that respond instantly, qualify interest, and move students from inquiry to application—even outside office hours.
                  </p>
                  <p className="text-gray-700">
                    <strong>Expand reach across markets</strong>
                    <br />
                    Engage local and international students in multiple languages, helping institutions market programs to broader audiences without increasing acquisition costs.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Sign Up
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}
                <div className="bg-white rounded-lg shadow-lg p-2 relative">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/Ellis.png"
                        alt="AI Agent"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <span className="text-gray-800 font-bold">Elli</span>
                      <span className="text-gray-500">AI Agent</span>
                    </div>
                  </div>
                  {/* Chat content */}
                  <div className="space-y">
                    <div className="text-sm space-y-2">
                      <p className="bg-gray-100 p-3 rounded-lg">
                        Hello thanks for reaching out! I am an AI assistant that is trained to answer your questions about our school.
                        What would you like to know?
                      </p>
                      <p className="text-right text-orange-600 font-semibold">
                        What curriculum does your school teach? 
                      </p>
                    </div>
                    <div className="text-sm space-y-2">
                      <p className="bg-gray-100 p-3 rounded-lg">
                        Thanks for asking, Our school covers both the IGCSE and the National Curriculum. 
                        Please provide me with an email so we can share more detailed information about our curriculum. 
                      </p>
                      <p className="text-right text-orange-600 font-semibold">
                        Nope, am good! I don't need more details
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <input
                        type="text"
                        className="w-full p-2 text-gray-800 bg-transparent outline-none"
                        placeholder="Reply"
                      />
                      <div className="flex space-x-2 text-gray-500">
                        <span>😊</span>
                        <span>📎</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* Card 4: Government Agencies Section  */}
          <div className="bg-gray-10 py-8 border border-gray-100 mt-10 rounded-lg p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                      Government Agencies
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Government Agencies</h2>
                  <p className="text-gray-700">
                    <strong>Use case:</strong>
                    <br />
                    Public sector organizations need to promote services, programs, and initiatives while managing high citizen demand. Intelli helps government agencies communicate, engage, and drive adoption of public services through WhatsApp.
                  </p>
                  <p className="text-gray-700">
                    <strong>Increase service adoption</strong>
                    <br />
                    Promote public programs, applications, and initiatives with proactive messaging that helps citizens understand and act faster.
                  </p>

                  <p className="text-gray-700">
                    <strong>Reduce friction in citizen journeys</strong>
                    <br />
                    Automate guidance, reminders, and updates that help citizens complete applications and access services with fewer delays.
                  </p>

                  <p className="text-gray-700">
                    <strong>Communicate at national scale</strong>
                    <br />
                    Deliver clear, consistent messaging across regions and languages without overwhelming frontline staff.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Get Started
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}
                <Image
                    src="/gov3.webp"
                    alt="Travel image"
                    width={700} // Specify the width
                    height={700} // Specify the height
                    className="w-full h-auto object-cover rounded-lg" // Ensure responsiveness
                  />
                
       
              </div>
            </div>
          </div>

         
        </div>
      </section>
    </div>
  );
};

export default UseCaseSection;
