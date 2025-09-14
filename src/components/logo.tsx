import {Sparkles} from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-6 w-6 text-primary" />
      <span className="font-headline text-2xl font-bold text-primary">PromptPal</span>
    </div>
  );
}
