// components/quickstart/building-options.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const options = [
  { title: 'Comments', description: 'Discuss anything together' },
  { title: 'Notifications', description: 'Notify your users' },
  { title: 'Text editor', description: 'Edit documents together' },
  { title: 'Whiteboard', description: 'Brainstorm ideas together' },
  { title: 'Creative tool', description: 'Create anything together' },
  { title: 'Form', description: 'Fill out forms together' },
  { title: 'Code editor', description: 'Code together' },
  { title: 'Custom', description: 'Build your own collaborative experience' },
];

export default function BuildingOptions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What are you building?</h3>
      <p className="text-sm text-gray-500">
        Choose from common collaborative experiences or go fully custom.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => (
          <Card key={option.title} className="cursor-pointer hover:bg-gray-100">
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