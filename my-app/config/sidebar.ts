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
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    badge: 0, // dynamic — overridden at runtime
  },
  {
    type: 'group',
    label: 'Conversations',
    icon: MessageSquare,
    defaultOpen: true,
    children: [
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
      {
        type: 'link',
        label: 'Website',
        icon: Globe,
        href: '/dashboard/conversations/website',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Section 2 — Workspace (labeled "Workspace")
// ---------------------------------------------------------------------------

export const workspaceItems: SidebarItem[] = [
  {
    type: 'group',
    label: 'Audiences',
    icon: Users,
    defaultOpen: false,
    children: [
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
    ],
  },
  {
    type: 'group',
    label: 'Commerce',
    icon: ShoppingBag,
    defaultOpen: false,
    children: [
      {
        type: 'link',
        label: 'Orders',
        icon: ShoppingCart,
        href: '/dashboard/commerce/orders',
      },
      {
        type: 'link',
        label: 'Products',
        icon: Package,
        href: '/dashboard/commerce/products',
      },
      {
        type: 'link',
        label: 'Payments',
        icon: CreditCard,
        href: '/dashboard/commerce/payments',
      },
    ],
  },
  {
    type: 'link',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
  },
  {
    type: 'more',
    label: 'More',
    icon: MoreHorizontal,
    children: [
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
    ],
  },
];
