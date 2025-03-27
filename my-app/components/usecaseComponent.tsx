import Link from "next/link";
import React from "react";
import Image from "next/image";

const UsecaseComponent = () => {
  return (
    <div>
      <h2 className="text-center text-5xl font-bold mb-10">
        Intelli is for these businesses
      </h2>
      <section className="bg-gray-10 py-16 border border-gray-100 rounded-3xl">
        <div className="container mx-auto px-2 md:px-8 ">

          {/* Card 1: Travel Agencies */}
          <div className="bg-gray-10 mt-10 rounded-lg shadow-sm p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Right Section: Image */}
                <Image
                  src="/travel-agent.avif"
                  alt="Travel image"
                  width={600}
                  height={600}
                  className="w-auto h-auto object-cover border rounded-lg"
                />
                
                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Travel
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Travel Agencies</h2>
                  <p className="text-gray-700">
                    <strong>How travel agencies use Intelli:</strong>
                    <br />
                    Travel agencies receive numerous inquiries about booking
                    details, travel packages, and visa requirements. Intelli
                    responds to these common questions, on behalf of your agency providing
                    customers with the information they need quickly.
                  </p>

                  <Link href="/usecases">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: NGO Section */}
          <div className="bg-white mt-10 rounded-lg shadow-sm  p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Right Section: Image */}
                <Image
                  src="/arclight.jpg"
                  alt="NGO image"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg"
                />
                
                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      NGOs
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold">NGOs</h3>
                  <p className="text-gray-700">
                    <strong>How NGOs use Intelli:</strong>
                    <br />
                    NGOs can use Intelli to efficiently manage inquiries related
                    to their programs, such as scholarship applications, business
                    grants, or training sessions.
                  </p>

                  <Link href="/usecases">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Schools Section */}
          <div className="bg-white mt-10 rounded-lg shadow-sm p-4">
            <div className="space-y-2 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Right Section: Chatbot UI */}
                <div className="bg-white rounded-lg shadow-lg p-2 relative">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/Ellis.png"
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

                {/* Left Section: Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Schools
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Schools</h2>
                  <p className="text-gray-700">
                    <strong>How schools use Intelli:</strong>
                    <br />
                    Schools receive a lot of inquiries from students & parents
                    regarding enrollment, course details, schedules, and more.
                    Intelli can help by automating responses to these common
                    questions.
                  </p>

                  <Link href="/usecases">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Government Agencies Section */}
          <div className="bg-white mt-10 rounded-lg shadow-smuseca p-4">
            <div className="space-y-4 mb-4">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-8">
                {/* Right Section: Image */}
                <Image
                  src="/gov3.webp"
                  alt="Government image"
                  width={700}
                  height={700}
                  className="w-full h-auto object-cover rounded-lg"
                />

                {/* Left Section: Text Block */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                      Government
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">Government Agencies</h2>
                  <p className="text-gray-700">
                    <strong>How governments use Intelli:</strong>
                    <br />
                    Government agencies often handle a lot of inquiries regarding
                    various services, such as permit applications, tax information,
                    and public assistance programs from the public. Intelli can
                    automate responses, providing detailed information to citizens.
                  </p>

                  <Link href="/usecases">
                    <button className="mt-4 bg-gradient-to-r from-teal-400 to-blue-600 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500  px-6 py-2 rounded-xl shadow-lg hover:bg-gray-200">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default UsecaseComponent;
