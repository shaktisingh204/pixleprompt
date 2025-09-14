import {SignupForm} from '@/components/auth/signup-form';
import {Logo} from '@/components/logo';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <Logo />
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
