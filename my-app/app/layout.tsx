import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelli App",
  description: "Your intelligent Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}

      <Toaster
      toastOptions={{
        unstyled: true,
        classNames: {
          error: 'bg-red-400',
          success: 'text-green-400',
          warning: 'text-yellow-400',
          info: 'bg-blue-400',
        },
      }}

      richColors
    />
  
      </body>
    </html>
  );
}
