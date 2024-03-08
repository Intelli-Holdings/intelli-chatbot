import { Navbar } from "@/components/navbar";
import React from "react";
// import { Separator } from "@/components/ui/separator";



export default function Company() {
  return (
    <div className="relative">
      <Navbar />
    <main className="pt-16">
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <h1 className="text-5xl font-bold text-left text-blue-600 mb-20">Building AI products for efficient businesses</h1>
          <p className="mt-4 text-2xl text-left text-gray-600">SQWEYA is an AI studio and research company. We build light, efficient, and malleable AI-powered products for traditional industries.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-10">Learn More</button>
    
            
        </section>

      <hr className="my-4 mx-auto border-t-1 border-gray-300 w-4/6"  />
      <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
         <p className="mt-4 text-xl text-left text-gray-600">Our Purpose</p>
      </section>
    

    </main>


      <footer className="w-full left-0 right-0 bg-gray-800 py-4 ">
        <div className="container ">
          <p className="text-sm text-center text-gray-400">Need help? Get in touch with us.</p>
          <p className="mt-2 text-xs text-center text-gray-500">
            Terms of Use | Privacy Notice | Data Policy | Socials | © IntelliConcierge 2024
          </p>
        </div>
      </footer>
    </div>
  )
}



