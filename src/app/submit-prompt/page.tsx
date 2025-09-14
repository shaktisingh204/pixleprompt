import {getSession} from '@/lib/auth';
import {categories} from '@/lib/data';
import {Header} from '@/components/layout/header';
import {SubmitPromptForm} from '@/components/prompts/submit-prompt-form';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ChevronLeft} from 'lucide-react';

export default async function SubmitPromptPage() {
  const user = await getSession();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-2xl gap-4">
          <div>
            <Button asChild variant="ghost" className="-ml-4">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-semibold">Submit a New Prompt</h1>
            <p className="text-muted-foreground">
              Contribute to the community by sharing your own creative prompts. It will be reviewed
              by an admin before appearing in the library.
            </p>
          </div>
          <SubmitPromptForm categories={categories} />
        </div>
      </main>
    </div>
  );
}
