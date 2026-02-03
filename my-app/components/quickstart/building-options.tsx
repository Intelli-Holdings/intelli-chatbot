// components/quickstart/building-options.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExclamationTriangleIcon, SpaceEvenlyVerticallyIcon } from '@radix-ui/react-icons';


const options = [
  { title: 'Whatsapp Assistant', 
    description: 'Handles inquiries on Whatsapp', 
    icon: '', 
  },
 
  { title: 'Website Widget', 
    description: 'Make your website more engaging', 
    icon: '',
    },

  { title: 'Workflows', 
    description: 'Create anything together with your workflows' , 
    icon: '' },
  { title: 'Email Assistant', 
    description: 'Respond to emails faster and with wit' , 
    icon: ExclamationTriangleIcon },
  { title: 'AI Voice Assistant', 
    description: 'Use our Cutting edge voice AI' , 
    icon: '' },
  { title: 'Custom', 
    description: 'Build your own customer service experience' , 
    icon: '' },
];

export default function BuildingOptions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What will you build?</h3>
      <p className="text-sm text-gray-500">
        Choose from existing channels or go fully custom.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => (
          <Card key={option.title} className="cursor-pointer hover:bg-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">{option.title}</CardTitle>
              
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">{option.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}