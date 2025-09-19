
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Logo } from '../logo';

export function LoginForm() {
  const [state, dispatch] = useFormState(signIn, undefined);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
            <Logo />
        </div>
        <CardTitle>Admin Login</CardTitle>
        <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="admin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {state?.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                    {state.error}
                </AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}
