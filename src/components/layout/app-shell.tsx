'use client';

import type {User} from '@/lib/definitions';
import {getSession} from '@/lib/auth';
import Link from 'next/link';
import {
  Home,
  FileText,
  Shield,
  Mail,
  PlusCircle,
  LayoutGrid,
} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';

function MainContent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const pathname = usePathname();
  
  const bottomNavItems = [
    {href: '/', label: 'Browse', icon: LayoutGrid},
    {href: '/contact', label: 'Contact', icon: Mail},
  ];

  // In a real app, you'd likely have a better way to detect mobile
  const [isMobile, setIsMobile] = useState(false);
   useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  return (
    <div className="flex flex-col w-full min-h-screen">
       <Header user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Footer />
      {isMobile && (
         <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background">
         <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
           {bottomNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-sm">{item.label}</span>
              </Link>
           ))}
         </div>
       </div>
      )}
    </div>
  );
}


export function AppShell({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setUser(session);
    };
    fetchSession();
  }, []);

  return <MainContent user={user}>{children}</MainContent>;
}
