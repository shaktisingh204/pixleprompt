import Link from 'next/link';
import {Logo} from '@/components/logo';
import { AdBanner } from '../ad-banner';

export function Footer() {
  const footerLinks = [
    {href: '/terms', label: 'Terms'},
    {href: '/privacy', label: 'Privacy'},
    {href: '/contact', label: 'Contact'},
  ];

  return (
    <footer className="hidden md:block mt-auto border-t bg-background">
      <div className="container mx-auto px-6 py-8">
        <AdBanner />
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
            © {new Date().getFullYear()} PixelPrompts. All Rights Reserved.
          </p>
          <div className="mt-4 flex items-center gap-4 sm:mt-0">
            {footerLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
