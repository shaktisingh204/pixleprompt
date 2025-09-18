
'use client';

import type {User} from '@/lib/definitions';
import {getSession} from '@/lib/actions';
import Link from 'next/link';
import {
  FileText,
  Shield,
  Mail,
  LayoutGrid,
  MoreHorizontal,
  PanelLeft,
} from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

function MainContent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isLinksSheetOpen, setLinksSheetOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSheetOpenChange = (open: boolean) => {
    setLinksSheetOpen(open);
  };

  const mainNavItems = [
    {href: '/', label: 'Browse', icon: LayoutGrid},
  ];

  const moreLinks = [
    {href: '/terms', label: 'Terms', icon: FileText},
    {href: '/privacy', label: 'Privacy', icon: Shield},
    {href: '/contact', label: 'Contact', icon: Mail},
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      <Footer />
      {isMobile && (
        <>
          <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background">
            <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
              {mainNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
               <button
                onClick={() => handleSheetOpenChange(true)}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
                  isLinksSheetOpen ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <MoreHorizontal className="w-5 h-5 mb-1" />
                <span className="text-sm">More</span>
              </button>
            </div>
          </div>
          <Sheet open={isLinksSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetContent side="bottom" className='rounded-t-lg'>
              <SheetHeader>
                <SheetTitle>More Options</SheetTitle>
              </SheetHeader>
              <div className="grid gap-3 py-4">
                {moreLinks.map(link => (
                   <Button
                   key={link.href}
                   asChild
                   variant="ghost"
                   className="justify-start"
                   onClick={() => handleSheetOpenChange(false)}
                 >
                   <Link href={link.href}>
                     <link.icon className="mr-2 h-4 w-4" />
                     {link.label}
                   </Link>
                 </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}

export function AppShell({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setUser(session);

      // Perform client-side redirects based on role and path
      if (!session) {
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
      } else {
        if (session.role !== 'admin' && pathname.startsWith('/admin')) {
          router.push('/');
        }
        if (session.role === 'admin' && pathname === '/admin/login') {
          router.push('/admin');
        }
      }
    };
    fetchSession();
  }, [pathname, router]);

  return <MainContent user={user}>{children}</MainContent>;
}
