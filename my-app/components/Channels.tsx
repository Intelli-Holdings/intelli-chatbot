import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Copy,
  ShoppingBag,
  PhoneCall,
  BookAIcon,
  Book,
  MessageCircle
} from 'lucide-react';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';

type ButtonState = 'coming-soon' | 'create' | 'subscribe';

interface ChannelCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isNew?: boolean;
  buttonState: ButtonState;
  buttonLink: string;
}

const getButtonProps = (state: ButtonState) => {
  switch (state) {
    case 'coming-soon':
      return {
        text: 'Coming Soon',
        variant: 'secondary' as const,
        disabled: true
      };
    case 'create':
      return {
        text: 'Create',
        variant: 'default' as const,
        disabled: false
      };
    case 'subscribe':
      return {
        text: 'Request Access',
        variant: 'outline' as const,
        disabled: false
      };
  }
};

const ChannelCard: React.FC<ChannelCardProps> = ({
  title,
  description,
  icon,
  isNew,
  buttonState,
  buttonLink
}) => {
  const buttonProps = getButtonProps(buttonState);

  return (
    <Card className="flex flex-col p-6 hover:shadow-lg transition-shadow">
      <div className="relative">
        {isNew && (
          <span className="absolute -top-2 -right-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
            New
          </span>
        )}
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <Link href={buttonLink} className="flex-1">
          <Button 
            variant={buttonProps.variant}
            className="w-full"
            disabled={buttonProps.disabled}
          >
            {buttonProps.text}
          </Button>
        </Link>
        
      </div>
    </Card>
  );
};

const Channels = () => {
  const channels = [
    {
      title: 'Website Widget',
      description: 'Add a chat widget to your website and let your chatbot interact with visitors in real-time.',
      icon: (
        <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center">
          <Globe className="w-8 h-8" />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      buttonLink: '/dashboard/playground'
    },
    {
      title: 'WhatsApp',
      description: 'Create an assistant and connect it to a WhatsApp number and let it respond to messages from your customers.',
      icon: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white">
          <Image
            src="/whatsapp.png"
            alt="WhatsApp"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      buttonLink: '/dashboard/channels/whatsapp'
    },
    {
      title: 'Facebook',
      description: 'Create an assistant and connect it to a Facebook page and let it respond to messages from your customers.',
      icon: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white">
          <Image
            src="/facebook.png"
            alt="Messenger"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      ),
      isNew: true,
      buttonState: 'coming-soon' as ButtonState,
      buttonLink: '#'
    },
    {
      title: 'Instagram',
      description: 'Create an assistant and connect it to a Instagram page and let it respond to messages from your customers.',
      icon: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white">
          <Image
            src="/instagram.png"
            alt="Messenger"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      ),
      isNew: true,
      buttonState: 'coming-soon' as ButtonState,
      buttonLink: '#'
    },
    {
      title: 'Voice',
      description: 'Create an assistant and let it interact with your customers via Internet Voice Call or IVR, handle inquiries and drive sales.',
      icon: (
        <div className="w-12 h-12 bg-gray-500 text-white rounded-lg flex items-center justify-center">
          <PhoneCall className="w-6 h-6" />
        </div>
      ),
      buttonState: 'coming-soon' as ButtonState,
      buttonLink: '#'
    },
    {
      title: 'Email',
      description: 'Create an assistant and let it interact with your customers via Email Inbox, respond to inquiries, and close support tickets.',
      icon: (
        <div className="w-12 h-12 bg-gray-500 text-white rounded-lg flex items-center justify-center">
          <EnvelopeOpenIcon className="w-6 h-6" />
        </div>
      ),
      buttonState: 'coming-soon' as ButtonState,
      buttonLink: '#'
    }
  ];

  return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel, index) => (
            <ChannelCard
              key={index}
              {...channel}
            />
          ))}
        </div>
      </div>
  );
};

export default Channels;