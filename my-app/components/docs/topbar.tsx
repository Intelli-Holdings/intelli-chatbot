// app/components/docs/topbar.tsx

import Link from 'next/link';
import { mintConfig } from '@/lib/mint-config';
import { Search } from './search';
import { MintConfig, NavLink } from '@/types/mintConfig'; // Adjust the path if necessary

export const Topbar: React.FC = () => {
  const config: MintConfig = mintConfig;

  return (
    <div>
      {/* Main Topbar */}
      <div className="bg-white border-b border-gray-150 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src={config.logo.light} alt="Logo" className="h-8 w-8" />
            <span className="font-medium">{config.name}</span>
          </Link>
        </div>
        <Search />
        <div className="flex items-center gap-4">
          {config.topbarLinks.map((link: NavLink, index: number) => (
            <a key={index} href={link.url} className="hover:text-gray-300">
              {link.name}
            </a>
          ))}
          <a
  href={config.topbarCtaButton.url}
  className="bg-blue-100 text-blue-600 border border-blue-500 hover:border-blue-800 px-4 py-2 rounded-full hover:bg-blue-100"
>
  {config.topbarCtaButton.name}
</a>
        </div>
      </div>

      {/* Secondary Menu */}
      <div className="bg-gray-100 py-3 px-4 border-b border-gray-150">
        {config.secondaryMenu.map((link: NavLink, index: number) => (
          <a key={index} href={link.url} className="mr-6 hover:text-gray-300">
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
};