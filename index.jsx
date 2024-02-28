/**
 * v0 by Vercel.
 * @see https://v0.dev/t/6xya6SChfg2
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Component() {
  return (
    <div key="1" className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between p-4 bg-[#00BFFF] text-white rounded-t-lg">
          <ArrowLeftIcon className="text-white" />
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage alt="Support Agent 1" src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-xs font-semibold">Support Agents</p>
            </div>
          </div>
          <VolumeIcon className="text-white" />
        </div>
        <div className="flex flex-col items-start justify-between flex-1 p-4">
          <div className="w-full">
            <div className="mb-4 text-sm">
              <p className="font-bold">We typically reply in under 5 minutes</p>
              <p>Ask us anything, we're here to help!</p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="self-start rounded-lg bg-gray-100 p-3">
                <p>Welcome!</p>
                <p className="text-xs text-gray-600">Bot · Just now</p>
              </div>
            </div>
          </div>
          <div className="w-full mt-4">
            <Button className="w-full mb-2" variant="default">
              I'm a client
            </Button>
            <Button className="w-full" variant="outline">
              I'm not a client yet
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <MicIcon className="text-gray-600" />
          <Input className="flex-1 mx-4" placeholder="Type your message here" />
          <SendIcon className="text-gray-600" />
        </div>
      </div>
    </div>
  )
}

function ArrowLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}


function MicIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}


function SendIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


function VolumeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    </svg>
  )
}
