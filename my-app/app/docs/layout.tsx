// app/docs/layout.tsx

"use client";

import React from 'react';
import Sidebar from '@/components/docs/sidebar';
import { Topbar } from '@/components/docs/topbar';
import { Footer } from '@/components/docs/footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <div className="flex flex-col min-h-screen">
        {/* Topbar */}
        <Topbar />

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar searchParams={{ page: undefined }} />

          {/* Content */}
          <main className="max-w-4xl mx-auto px-4 py-8 space-y-10 flex-1">
            {children}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;