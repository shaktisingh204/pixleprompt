
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
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
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

function MainContent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const {isMobile} = useSidebar();
  const pathname = usePathname();
  return (
    <div className="flex flex-col w-full">
       <Header user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      {isMobile && (
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
      )}
    </div>
  );
}


export function AppShell({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setUser(session);
    };
    fetchSession();
  }, []);

  const menuItems = [
    {href: '/', label: 'Home', icon: Home},
    {href: '/terms', label: 'Terms', icon: FileText},
    {href: '/privacy', label: 'Privacy', icon: Shield},
    {href: '/contact', label: 'Contact', icon: Mail},
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="h-16 border-b" />
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
      <SidebarInset>
         <MainContent user={user}>{children}</MainContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
