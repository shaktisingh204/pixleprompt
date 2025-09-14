import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono';

export const metadata: Metadata = {
  title: 'PromptPal',
  description: 'Your creative partner for AI prompts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
