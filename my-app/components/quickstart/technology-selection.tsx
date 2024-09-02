// components/quickstart/technology-selection.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const technologies = [
  { name: 'Next.js', icon: '...' },
  { name: 'React', icon: '...' },
  { name: 'Redux', icon: '...' },
  { name: 'Zustand', icon: '...' },
  { name: 'Svelte', icon: '...' },
  { name: 'Vue.js', icon: '...' },
  { name: 'SolidJS', icon: '...' },
  { name: 'JavaScript', icon: '...' },
];

export default function TechnologySelection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select your technology</h3>
      <p className="text-sm text-gray-500">
        Choose one of the following step-by-step quickstart guides to help you get started.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {technologies.map((tech) => (
          <Card key={tech.name} className="cursor-pointer hover:bg-gray-100">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <span>{tech.icon}</span>
                <span>{tech.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                REALTIME APIS
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}