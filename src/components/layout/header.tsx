import type {User} from '@/lib/definitions';
import {UserNav} from '@/components/auth/user-nav';
import {Logo} from '@/components/logo';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';

type HeaderProps = {
  user: User | null;
};

export function Header({user}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
               {user.role === 'admin' && (
                <Button variant="outline" asChild>
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              )}
              <Button asChild>
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
      </div>
    </header>
  );
}
