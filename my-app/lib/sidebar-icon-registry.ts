import {
  Home,
  Bell,
  MessageSquare,
  Globe,
  Users,
  Contact,
  Megaphone,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  MoreHorizontal,
  Bot,
  MessageSquareCode,
  Layout,
  Star,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { MessengerIcon } from '@/components/icons/messenger-icon';

type IconComponent = React.ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  Home,
  Bell,
  MessageSquare,
  Globe,
  Users,
  Contact,
  Megaphone,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  MoreHorizontal,
  Bot,
  MessageSquareCode,
  Layout,
  Star,
  WhatsApp: WhatsAppIcon,
  Instagram: InstagramIcon,
  Messenger: MessengerIcon,
};

export function resolveIcon(name: string): IconComponent {
  return iconMap[name] ?? Star;
}

/**
 * Reverse-lookup: given an icon component, return its registry key.
 * Falls back to 'Star' if not found.
 */
export function getIconName(icon: IconComponent): string {
  for (const [key, value] of Object.entries(iconMap)) {
    if (value === icon) return key;
  }
  return 'Star';
}
