// components/quickstart/invite-developer.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InviteEmployee() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Invite a team member or employee to gain access.
      </p>
      <div className="space-y-2">
        <Label htmlFor="email">Employee&apos;s email</Label>
        <div className="flex space-x-2">
          <Input id="email" placeholder="Enter email address" />
          
        </div>
        <Button>Send Invite</Button>
      </div>
    </div>
  );
}