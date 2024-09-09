// components/ProductTeamsSection.tsx
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { MagicCard } from '@/components/magicui/magic-card';
import { Box, Cpu, PenTool, X } from 'lucide-react'; // Importing X icon

interface CardProps {
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  gradientColor: string;
}

const Card = ({ title, description, content, icon, gradientColor }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <MagicCard
        className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-center p-8 rounded-lg"
        gradientColor={gradientColor}
        onClick={toggleModal}
      >
        <div className="text-white text-center mb-1">{icon}</div> {/* Icon added */}
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-4">{description}</p>
      </MagicCard>

      {/* Full-screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-100 text-black p-8 rounded-lg max-w-2xl w-full h-full overflow-y-auto shadow-lg relative">
            {/* X icon for closing modal */}
            <div className="absolute top-4 right-4 cursor-pointer" onClick={toggleModal}>
              <X size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p>{content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductSection = () => {

  return (
    <section className="bg-white text-black py-12 px-6">
      <div className="text-center">
        <h2 className="mb-1 text-center text-4xl font-bold tracking-tighter text-4xl font-bold text-center text-blue-600">How it works</h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          Linear is shaped by the practices and principles that distinguish world-class product teams from the rest: relentless focus, fast execution, and a commitment to the quality of craft.
        </p>
      </div>
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card
          title="Purpose-built for product development"
          description="Purpose-built for product development"
          content="This card contains detailed information about how the tool is purpose-built for developers to achieve their goals efficiently."
          icon={<Box size={48} />}
          gradientColor={ "light" ? "orange" : "yellow"} // Color for gradient
        />
        <Card
          title="Designed to move fast"
          description="Designed to move fast"
          content="This card explains the performance optimization, including a 50ms response time for blazing fast workflows."
          icon={<Cpu size={48} />}
          gradientColor={ "light" ? "orange" : "yellow"} // Color for gradient
        />
        <Card
          title="Crafted to perfection"
          description="Crafted to perfection"
          content="This card showcases the design and user experience principles that are crafted with precision for a seamless experience."
          icon={<PenTool size={48} />}
          gradientColor={"light" ? "purple" : "pink"} // Color for gradient
        />
      </div>
    </section>
  );
};

export default ProductSection;
