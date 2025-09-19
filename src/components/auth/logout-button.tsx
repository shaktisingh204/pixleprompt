
'use client';

import { signOut } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}
