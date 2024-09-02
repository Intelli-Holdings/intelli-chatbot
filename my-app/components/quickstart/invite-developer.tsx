// components/quickstart/invite-developer.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InviteDeveloper() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Integrating Liveblocks takes a few minutes but front-end coding skills are required. 
        Invite a developer to your team to help set things up.
      </p>
      <div className="space-y-2">
        <Label htmlFor="email">Developer&apos;s email</Label>
        <div className="flex space-x-2">
          <Input id="email" placeholder="Enter email address" />
          <Button>Invite</Button>
        </div>
      </div>
    </div>
  );
}