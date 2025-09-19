
import {Logo} from '@/components/logo';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/">
           <Logo />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <Button asChild>
          <Link href="/submit-prompt">
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit Prompt
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">
            Admin
          </Link>
        </Button>
      </div>
    </header>
  );
}
