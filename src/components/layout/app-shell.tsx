
'use client';

import type {User} from '@/lib/definitions';
import {getSession} from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {Logo} from '@/components/logo';
import {Button} from '@/components/ui/button';
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
import {UserNav} from '@/components/auth/user-nav';
import {cn} from '@/lib/utils';
import {useIsMobile} from '@/hooks/use-mobile';

export function AppShell({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getSession().then(setUser);
  }, []);

  const menuItems = [
    {href: '/', label: 'Home', icon: Home},
    {href: '/terms', label: 'Terms', icon: FileText},
    {href: '/privacy', label: 'Privacy', icon: Shield},
    {href: '/contact', label: 'Contact', icon: Mail},
  ];

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
           <Logo />
            <div className="flex flex-1 items-center justify-end space-x-4">
            {user ? (
                <UserNav user={user} />
            ) : (
                <Button asChild>
                <Link href="/login">Login</Link>
                </Button>
            )}
            </div>
        </header>
        <main className="flex-1 pb-20">{children}</main>
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background">
          <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
            <Link
              href="/"
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <LayoutGrid className="w-5 h-5 mb-1" />
              <span className="text-sm">Browse</span>
            </Link>
            <Link
              href="/submit-prompt"
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
                pathname === '/submit-prompt' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <PlusCircle className="w-5 h-5 mb-1" />
              <span className="text-sm">Submit</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{children: item.label}}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
