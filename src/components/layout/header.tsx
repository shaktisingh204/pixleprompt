
import type {User} from '@/lib/definitions';
import {UserNav} from '@/components/auth/user-nav';
import {Logo} from '@/components/logo';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';
import {SidebarTrigger} from '@/components/ui/sidebar';
import {useIsMobile} from '@/hooks/use-mobile';


type HeaderProps = {
  user: User | null;
};

export function Header({user}: HeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {!isMobile ? (
         <SidebarTrigger />
      ) : (
        <Link href="/">
           <Logo />
        </Link>
      )}

      <div className="flex flex-1 items-center justify-end space-x-4">
        {user ? (
          <>
            {user.role === 'admin' && (
              <Button variant="outline" asChild>
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
             <Button asChild className="hidden md:flex">
                <Link href="/submit-prompt">
                  <PlusCircle className="mr-2" />
                  Submit Prompt
                </Link>
              </Button>
            <UserNav user={user} />
          </>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
