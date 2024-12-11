// app/components/docs/sidebar.tsx

import Link from 'next/link';
import { mintConfig } from '@/lib/mint-config';
import { MintConfig, SidebarLink, NavLink } from '@/types/mintConfig'; // Adjust the path if necessary

export const Sidebar: React.FC = () => {
  const config: MintConfig = mintConfig;

  return (
    <div className="bg-white border-r border-gray-150 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-8">
        {config.navigation.map((link: SidebarLink, index: number) => (
          <div key={index}>
            <h3 className="text-gray-500 font-medium text-sm uppercase mb-4">
              {link.group}
            </h3>
            <nav className="space-y-2">
              {link.pages.map((page: NavLink, pageIndex: number) => (
                <Link key={pageIndex} href={page.url} legacyBehavior>
                  <a className="block text-gray-700 hover:text-gray-900 font-medium">
                    {page.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
};