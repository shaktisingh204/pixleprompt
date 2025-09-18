import {LoginForm} from '@/components/auth/login-form';
import {Logo} from '@/components/logo';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <Logo />
        </div>
        <h1 className="text-center font-headline text-2xl font-semibold">Admin Login</h1>
        <p className="text-center text-muted-foreground">This login is for administrators only.</p>
        <LoginForm />
      </div>
    </main>
  );
}
