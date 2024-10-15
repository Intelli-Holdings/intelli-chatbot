// components/quickstart/create-organization.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateOrganization() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        To get started first create your organization; 
      </p>
      <div className="space-y-2">
        <Label htmlFor="email">Organization Name:</Label>
        <div className="flex space-x-2">
          <Input id="email" placeholder="Enter organization name" />
          
        </div>
        <Label htmlFor="email">Company Email:</Label>
        <div className="flex space-x-2">
          <Input id="email" placeholder="Enter company email address" />
          
        </div>
        <Label htmlFor="email">Company Phone Number:</Label>
        <div className="flex space-x-2">
          <Input id="email" placeholder="Enter company phone number" />
          
        </div>
      </div>
      <Button className='w-full'>Create Organization</Button>

    </div>
  );
}