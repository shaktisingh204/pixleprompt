import type {User} from '@/lib/definitions';
import {UserNav} from '@/components/auth/user-nav';
import {Logo} from '@/components/logo';
import Link from 'next/link';

type HeaderProps = {
  user: User | null;
};

export function Header({user}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
