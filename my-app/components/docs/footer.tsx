// app/components/docs/footer.tsx

import Link from 'next/link';
import { mintConfig } from '@/lib/mint-config';

export const Footer: React.FC = () => {
  return (
    <div className="bg-white-100 justify-items items-center border shadow-sm text-center text-blue-700 py-6 px-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {Object.entries(mintConfig.footerSocials).map(([key, url], index) => (
            <a key={index} href={url} className="hover:text-gray-300">
              <i className={`fa fa-${key}`} />
            </a>
          ))}
        </div>
        <div className="text-sm">
          &copy; {new Date().getFullYear()} {mintConfig.name}. All rights reserved.
        </div>
      </div>
    </div>
  );
};