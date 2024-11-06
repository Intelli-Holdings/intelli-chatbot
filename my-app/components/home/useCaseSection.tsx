import Link from "next/link";
import React from "react";
import { ChatPreview } from "../chat-preview";
import { ChatWindow } from "../chat-window";
import Image from "next/image";

const UseCaseSection = () => {
  return (
    <div>
      <h2 className="text-center text-5xl font-bold mb-10">
        Intelli is for these businesses.
      </h2>
      <section className="bg-gray-10 py-16 border border-gray-100 rounded-xl">
        <div className="container mx-auto px-2 md:px-8 ">
          {/* Card 1: NGO Section */}
          <div className="bg-white mt-10 rounded-lg shadow-lg p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      NGOs
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold">NGOs</h3>
                  <p className="text-gray-700">
                    <strong>Usecase:</strong>
                    <br />
                    NGOs can use Intelli to efficiently manage inquiries related
                    to their programs, such as scholarship applications,
                    business grants, or training sessions.
                  </p>
                  <p className="text-gray-700">
                    <strong>Accessible 24/7</strong>
                    <br />
                    They receive a high volume of questions from applicants and
                    participants. Intelli can automate responses to these
                    frequently asked questions in a conversational and natural
                    way.
                  </p>
                  <p className="text-gray-700">
                    <strong>Multilingual Support:</strong>
                    <br />
                    If the AI agent receives an inquiry it can&apos;t handle, a
                    human agent can take over. Intelli supports multiple
                    languages, allowing NGOs to cater to a diverse audience.
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

          {/* Card 2: Schools Section */}
          <div className="bg-white mt-10 rounded-lg shadow-lg p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Schools
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Schools</h2>
                  <p className="text-gray-700">
                    <strong>Usecase:</strong>
                    <br />
                    Schools receive a lot of inquiries from students & parents
                    regarding enrollment, course details, schedules, and more.
                    Intelli can help by automating responses to these common
                    questions.
                  </p>
                  <p className="text-gray-700">
                    <strong>Streamline operations</strong>
                    <br />
                    Frees up school staff to focus on more critical tasks by
                    reducing routine inquiries. When inquiries become too
                    complex or outside the AI&apos;s capabilities, human support
                    can easily step in.
                  </p>
                  <p className="text-gray-700">
                    <strong>24/7 availability:</strong>
                    <br />
                    Offers continuous support, ensuring students can get help
                    even outside of regular office hours.
                  </p>
                  <p className="text-gray-700">
                    <strong>Multilingual Support:</strong>
                    <br />
                    Ensures that students from various linguistic backgrounds
                    receive the support they need in their preferred language.{" "}
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
                      <img
                        src="/Ellis.png" // Replace with the correct icon
                        alt="AI Agent"
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
                        Nope, am good! I don&apos;t need more details
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

          {/* Card 3: Government Agencies Section  */}
          <div className="bg-white mt-10 rounded-lg shadow-lg p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                      Government
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Government Agencies</h2>
                  <p className="text-gray-700">
                    <strong>Usecase:</strong>
                    <br />
                    Government agencies often handle a lot of inquiries
                    regarding various services, such as permit applications, tax
                    information, and public assistance programs from the public.
                    Intelli can automate responses, providing detailed
                    information to citizens.
                  </p>
                  <p className="text-gray-700">
                    <strong>Enhanced Public Service</strong>
                    <br />
                    Provides citizens with accurate, timely information and
                    support, improving public satisfaction.
                  </p>

                  <p className="text-gray-700">
                    <strong>Operational efficiency</strong>
                    <br />
                    Reduces the burden on public servants and staff of these
                    parastatals by automating inquiries.
                  </p>

                  <p className="text-gray-700">
                    <strong>Consistency in Communication</strong>
                    <br />
                    Ensures consistent communication and service across
                    platforms, including social media, email, and web chat.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Get Started
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}
                <Image
                    src="/conversation.jpg"
                    alt="Travel image"
                    width={700} // Specify the width
                    height={700} // Specify the height
                    className="w-full h-auto object-cover rounded-lg" // Ensure responsiveness
                  />
                
       
              </div>
            </div>
          </div>

          {/* Card 4: Travel Agencies  */}
          <div className="bg-white mt-10 rounded-lg shadow-lg p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Travel
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Travel Agencies</h2>
                  <p className="text-gray-700">
                    <strong>Usecase:</strong>
                    <br />
                    Travel agencies often receive numerous inquiries about
                    booking details, travel packages, visa requirements, and
                    more. Intelli can automate responses to these common
                    questions, providing customers with the information they
                    need quickly and efficiently. It can also guide customers
                    through the booking process with step-by-step instructions.
                    For complex inquiries, human agents can seamlessly take
                    over. With Intelli’s multilingual support, travel agencies
                    can assist customers from around the world in their
                    preferred language, and its 24/7 availability ensures
                    customers receive support whenever they need it.
                  </p>
                  <p className="text-gray-700">
                    <strong>Customer Satisfaction</strong>
                    <br />
                    Enhances the customer experience by providing quick and
                    accurate information.
                  </p>
                  <p className="text-gray-700">
                    <strong>Multi-lingual Support</strong>
                    <br />
                    Allows agencies to serve a global clientele, overcoming
                    language barriers.
                  </p>
                  <Link href="/auth/sign-up">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Get Started 
                    </button>
                  </Link>
                </div>

                {/* Right Section: Chatbot UI */}

                
                  <Image
                    src="/support.png"
                    alt="Travel image"
                    width={600} // Specify the width
                    height={600} // Specify the height
                    className="w-auto h-auto object-cover border rounded-lg" // Ensure responsiveness
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
