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
  Building2,
  Settings,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { MessengerIcon } from '@/components/icons/messenger-icon';
import type { SidebarItem } from '@/types/sidebar';

// ---------------------------------------------------------------------------
// Section 1 — Core (no label, top of sidebar)
// ---------------------------------------------------------------------------

export const coreItems: SidebarItem[] = [
  {
    type: 'link',
    label: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  {
    type: 'link',
    label: 'Assistants',
    icon: Bot,
    href: '/dashboard/assistants',
  },
  {
    type: 'link',
    label: 'Chatbots',
    icon: MessageSquareCode,
    href: '/dashboard/chatbots',
  },
  {
    type: 'link',
    label: 'Widgets',
    icon: Layout,
    href: '/dashboard/widgets',
  },
  {
    type: 'group',
    label: 'Conversations',
    icon: MessageSquare,
    defaultOpen: true,
    children: [
      {
        type: 'link',
        label: 'Website',
        icon: Globe,
        href: '/dashboard/conversations/website',
      },
      {
        type: 'link',
        label: 'WhatsApp',
        icon: WhatsAppIcon,
        href: '/dashboard/conversations/whatsapp',
      },
      {
        type: 'link',
        label: 'Instagram',
        icon: InstagramIcon,
        href: '/dashboard/conversations/instagram',
      },
      {
        type: 'link',
        label: 'Messenger',
        icon: MessengerIcon,
        href: '/dashboard/conversations/messenger',
      },
    ],
  },
  {
    type: 'link',
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    badge: 0, // dynamic — overridden at runtime
  },
  {
    type: 'link',
    label: 'Contacts',
    icon: Contact,
    href: '/dashboard/contacts',
  },
  {
    type: 'link',
    label: 'Campaigns',
    icon: Megaphone,
    href: '/dashboard/campaigns',
  },
  {
    type: 'link',
    label: 'Templates',
    icon: FileText,
    href: '/dashboard/templates',
  },
  {
    type: 'link',
    label: 'Commerce',
    icon: ShoppingBag,
    href: '/dashboard/commerce',
  },
  {
    type: 'link',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
  },
  {
    type: 'link',
    label: 'Organization',
    icon: Building2,
    href: '/dashboard/organization',
  },
  {
    type: 'link',
    label: 'Billing',
    icon: CreditCard,
    href: '/dashboard/billing',
  },
  {
    type: 'link',
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

// ---------------------------------------------------------------------------
// Section 2 — Workspace (labeled "Workspace")
// ---------------------------------------------------------------------------

export const workspaceItems: SidebarItem[] = [];
