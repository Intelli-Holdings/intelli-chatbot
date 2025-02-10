import {
  Settings,
  SparklesIcon,
  MousePointerClick,
  Hammer,
  PenIcon,
  Clipboard,
  MousePointer,
  Package,
  Home,
  ShoppingBagIcon,
  HourglassIcon,
  Building,
  TreeDeciduous,
  ClipboardEdit,
  PersonStanding,
  Accessibility,
  FilePenIcon,
  PlaneTakeoff,
  PartyPopperIcon,
} from "lucide-react"; // Assuming you are using lucide-react for icons
import { Button } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons";

const HowItWorksSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto text-center">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-10">How to get started</h2>
        <p className="text-gray-600">
        Convert your website visitors into customers with these <strong>4 steps </strong> 
        </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm border relative">
              <FilePenIcon className="text-[#007fff]" size={48} />
              <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                1
              </span>
            </div>
            <p className="mt-4 text-lg font-medium">Create an account</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm border relative">
              <SparklesIcon className="text-yellow-400" size={48} />
              <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                2
              </span>
            </div>
            <p className="mt-4 text-lg font-medium">
              Create an AI assistant
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm border relative">
              <ClipboardEdit  className="text-teal-500" size={48} />
              <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                3
              </span>
            </div>
            <p className="mt-4 text-lg font-medium">Create a widget</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm border relative">
              <PlaneTakeoff  className="text-green-500" size={48} />
              <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                4
              </span>
            </div>
            <p className="mt-4 text-lg font-medium">Add widget to your website</p>
          </div>
        </div>
        <div className="flex justify-center mt-10 mb-10 space-x-4">
          <a href="/auth/sign-up">
            <Button
              className="text-base sm:text-lg md:text-xl font-bold py-4 sm:py-6 md:py-8 px-6 sm:px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg 
                hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-700 bg-left bg-[length:200%_200%] hover:bg-right 
                ring-1 ring-teal-400 ring-offset-2 ring-opacity-60 transition-all duration-500 ease-in-out pulse-animation"
            >
              Get Started Free
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
