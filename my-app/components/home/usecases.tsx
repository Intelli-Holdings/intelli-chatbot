import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';


interface CommunicationCardProps {
  title: string;
  description: string;
  iconPath: string;
  bgColor: string;
  bgOpacity: string;
}

function CommunicationCard({ title, description, iconPath, bgColor, bgOpacity }: CommunicationCardProps) {
  return (
    <Card className={`${bgColor} ${bgOpacity}`}>
      <CardContent className="p-6 space-y-2 backdrop-blur-lg rounded-lg">
        <div className="flex items-center space-x-2">
        <div className="bg-white p-2 rounded-xl shadow-md relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#007fff">
            <path d={iconPath} />
          </svg>
        </div>
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
        <p className="text-sm font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Usecases() {
  return (
    <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
      <CommunicationCard
        title="Whatsapp:"
        description="Businesses whose primary communication method is WhatsApp use Intelli to broadcast messages, schedule important reminders, and automate responses."
        iconPath="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
        bgColor="bg-[#007fff]"
        bgOpacity="bg-opacity-35"
      />
      <CommunicationCard
        title="Websites:"
        description="Businesses that have high traffic to their websites need to respond to customer inquiries promptly, using the website widget can address this need."
        iconPath="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"
        bgColor="bg-[#ACD4FF]"
        bgOpacity="bg-opacity-85"
      />
      <CommunicationCard
        title="Email Inbox:"
        description="Immediately get notifications and alerts when customers request time-sensitive information and assistance."
        iconPath="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        bgColor="bg-[#027EFE]"
        bgOpacity="bg-opacity-60"
      />
    </div>
  );
}