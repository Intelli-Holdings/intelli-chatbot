import { Navbar } from "@/components/navbar";
import React from "react";
import { ChatWidget } from "@/components/ChatWidget";

export default function Company() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-16">
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h1 className="text-4xl font-bold text-left mb-4">
            AI Products That Create Market Segments
          </h1>
          <p className="mt-4 text-2xl text-left text-gray-400">
            At Intelli, we&apos;re not just building AI-powered products; we are creating a workplace where innovation, creativity, and fun go hand in hand. Join us as we shape the future, making businesses smarter, faster, and more efficient.
          </p>

        </section>

        <hr className="my-4 mx-auto border-t-1 border-gray-300 w-4/6" />
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h2 className="text-3xl font-bold mb-10">Our Mission and Vision</h2>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Mission</h4>
            <p className="mt-2 text-lg text-gray-600">
              Intelli is dedicated to streamlining customer support by providing a centralized platform that efficiently manages conversations across multiple channels and enhances overall satisfaction.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Vision</h4>
            <p className="mt-2 text-lg text-gray-600">
              Our vision is to be the go-to customer support solution for businesses, enabling seamless communication and ensuring exceptional experiences through technology.
            </p>
          </div>
        </section>

        <hr className="my-4 mx-auto border-t-1 border-gray-300 w-4/6" />

        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h2 className="text-3xl font-bold mb-10">Our Purpose</h2>

          <h3 className="text-2xl font-bold text-left text-gray-700 mb-6">G.L.O.W. Values</h3>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Good Vibes</h4>
            <p className="mt-2 text-lg text-gray-600">
              We cultivate an atmosphere of positivity, fun, and curiosity, creating a supportive environment where employees feel uplifted and motivated.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Leadership</h4>
            <p className="mt-2 text-lg text-gray-600">
              We lead by example, setting industry standards through innovation and empowering our team to take charge and succeed.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Oneness</h4>
            <p className="mt-2 text-lg text-gray-600">
              We believe in unity and collaboration, fostering a strong sense of teamwork and inclusivity among our employees and clients.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Well-being</h4>
            <p className="mt-2 text-lg text-gray-600">
              We prioritize the well-being of our team, ensuring a balanced and fulfilling work environment that supports both personal and professional growth.
            </p>
          </div>
        </section>


        <hr className="my-4 mx-auto border-t-1 border-gray-300 w-4/6" />

        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h2 className="text-3xl font-bold text-left mb-10">Why Work With Us</h2>

          <h3 className="text-2xl font-bold text-left text-gray-700 mb-6">Life at Intelli</h3>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Work That Matters</h4>
            <p className="mt-2 text-lg text-gray-600">
              At Intelli, you&apos;ll work on projects that make a real impact—helping businesses harness the power of AI to transform their operations. Whether you&apos;re passionate about AI, software development, or innovative technology, Intelli is the place to be.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Collaborative Culture</h4>
            <p className="mt-2 text-lg text-gray-600">
              Our culture is all about teamwork, innovation, and fun. We believe in a collaborative environment where everyone&apos;s voice is heard, and great ideas can come from anywhere. You&apos;ll find a diverse group of professionals all working together to solve some of the industry’s toughest challenges.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Benefits That Support You</h4>
            <p className="mt-2 text-lg text-gray-600">
              We care about our employees&apos; well-being, offering comprehensive benefits that support both your professional and personal growth. From health and wellness programs to professional development opportunities, Intelli ensures you have what you need to thrive.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-left text-gray-700">Opportunities to Grow</h4>
            <p className="mt-2 text-lg text-gray-600">
              At Intelli, your career development is a priority. We offer numerous opportunities for learning and growth, from leadership development programs to cross-functional projects. We&apos;re committed to helping you reach your full potential.
            </p>
          </div>

        </section>
        <hr className="my-4 mx-auto border-t-1 border-gray-300 w-4/6" />

        
      </main>
      <ChatWidget />
    </div>
  );
}
