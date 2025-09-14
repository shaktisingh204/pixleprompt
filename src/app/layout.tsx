import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono';
import {AppShell} from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'PixelPrompts',
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
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
