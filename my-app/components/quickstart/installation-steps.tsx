// components/quickstart/installation-steps.tsx

import { Button } from '@/components/ui/button';

const steps = [
  {
    title: 'Install Liveblocks',
    description: 'Every package should use the same version.',
    command: 'npm install @liveblocks/client @liveblocks/react',
  },
  {
    title: 'Initialize the liveblocks.config.ts file',
    description: 'We can use the CLI to generate this file for you.',
    command: 'npx create-liveblocks-app@latest --init --framework react',
  },
];

export default function InstallationSteps() {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-semibold">{index + 1}. {step.title}</h3>
          <p className="text-sm text-gray-500">{step.description}</p>
          <div className="bg-gray-100 p-2 rounded">
            <code className="text-sm">{step.command}</code>
          </div>
          <Button variant="outline">Copy</Button>
        </div>
      ))}
    </div>
  );
}