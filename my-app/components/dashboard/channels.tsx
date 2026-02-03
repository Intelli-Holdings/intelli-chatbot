import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, PhoneCall } from 'lucide-react';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

type ButtonState = 'coming-soon' | 'create' | 'subscribe';

interface ChannelCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonState: ButtonState;
  onClick?: () => void;
  badge?: string;
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
  buttonState,
  onClick,
  badge
}) => {
  const buttonProps = getButtonProps(buttonState);
  const buttonClassName =
    buttonState === 'create'
      ? 'h-8 w-full rounded-full bg-[#007fff] px-4 text-xs font-semibold text-white hover:bg-[#0067d6]'
      : 'h-8 w-full rounded-full px-4 text-xs font-semibold';

  return (
    <Card
      className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        <div className="mb-3">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-2">
        <Button 
          variant={buttonProps.variant}
          className={buttonClassName}
          disabled={buttonProps.disabled}
          onClick={buttonProps.disabled ? undefined : onClick}
        >
          {buttonProps.text}
        </Button>
      </div>
    </Card>
  );
};

interface ChannelsProps {
  onWhatsAppCreate: () => void;
  onWebsiteCreate: () => void;
  onFacebookCreate: () => void;
  onInstagramCreate: () => void;
}

const Channels: React.FC<ChannelsProps> = ({
  onWhatsAppCreate,
  onWebsiteCreate,
  onFacebookCreate,
  onInstagramCreate,
}) => {
  const channels = [
    {
      title: 'Website Widget',
      description: 'Create a website widget for your website and speak with website visitors in real-time.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
          <Globe className="h-5 w-5" />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      onClick: onWebsiteCreate
    },
    {
      title: 'WhatsApp',
      description: 'Create an assistant and connect it to a WhatsApp number and let it respond to messages from your customers.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50">
          <Image
            src="/whatsapp.png"
            alt="WhatsApp"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      onClick: onWhatsAppCreate
    },
    {
      title: 'Facebook Messenger',
      description: 'Create an assistant and connect it to a Facebook page and let it respond to messages from your customers.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
          <Image
            src="/Messenger_logo.png"
            alt="Facebook"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      onClick: onFacebookCreate,
      badge: 'Beta',
    },
    {
      title: 'Instagram',
      description: 'Create an assistant and connect it to an Instagram page and let it respond to messages from your customers.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-100 bg-pink-50">
          <Image
            src="/instagram.png"
            alt="Instagram"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        </div>
      ),
      buttonState: 'create' as ButtonState,
      onClick: onInstagramCreate,
      badge: 'Beta',
    },
    {
      title: 'Voice',
      description: 'Create an assistant and let it interact with your customers via Internet Voice Call or IVR, handle inquiries and drive sales.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-700">
          <PhoneCall className="h-5 w-5" />
        </div>
      ),
      buttonState: 'coming-soon' as ButtonState,
    },
    {
      title: 'Email',
      description: 'Create an assistant and let it interact with your customers via Email Inbox, respond to inquiries, and close support tickets.',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-700">
          <EnvelopeOpenIcon className="h-5 w-5" />
        </div>
      ),
      buttonState: 'coming-soon' as ButtonState,
    }
  ];

  return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel, index) => (
          <ChannelCard
            key={index}
            {...channel}
          />
        ))}
      </div>
  );
};

export default Channels;
