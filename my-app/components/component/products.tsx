import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

export function Products() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <Navbar />
      <header className="text-center py-20 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">
          Building AI tools that help businesses grow.
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
          Our first product, Intelli Concierge, is a smart, fun, and professional AI that helps with customer support.
          <br />
          We&apos;re working on even more tools to make businesses like yours smarter and more efficient.
        </p>
        <p className="mt-4 text-base md:text-lg text-gray-700 max-w-xl mx-auto italic">
          Discover the future of business with AI.
        </p>
        <div className="mt-8 mx-auto max-w-md">
          <form className="flex flex-col space-y-4">
            <Input
              className="shadow-sm border border-gray-100"
              placeholder="Enter your email"
              type="email"
            />
            <Button className="bg-blue-600 shadow-sm text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Book a Demo
            </Button>
          </form>
        </div>
      </header>
    </div>
  );
}
