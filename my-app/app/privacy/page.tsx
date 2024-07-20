import PrivacyPolicy from "@/components/privacy";
import { Navbar } from "@/components/navbar";
import React from "react";
// import { Separator } from "@/components/ui/separator";



export default function Privacy() {
  return (
    <div className="relative">
    <main className="pt-16">
    <Navbar />
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
        <PrivacyPolicy /> 
        </section>
      

    </main>
    </div>
  )
}



