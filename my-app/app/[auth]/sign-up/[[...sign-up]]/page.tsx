import { SignUp } from "@clerk/nextjs";
import { Navbar } from '@/components/navbar';

export default function Page() {
  return (
    <div className="flex justify-center py-24">
         <Navbar />
      <SignUp />
    </div>
  );
}