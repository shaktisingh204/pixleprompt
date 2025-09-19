
import {Logo} from '@/components/logo';
import Link from 'next/link';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/">
           <Logo />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <Button asChild variant="ghost">
          <Link href="/admin">Admin</Link>
        </Button>
      </div>
    </header>
  );
}
