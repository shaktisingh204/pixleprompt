import {notFound} from 'next/navigation';
import {prompts, categories, users} from '@/lib/data';
import {PlaceHolderImages} from '@/lib/placeholder-images';
import type {FullPrompt} from '@/lib/definitions';
import {Header} from '@/components/layout/header';
import {getSession} from '@/lib/auth';
import Image from 'next/image';
import {Badge} from '@/components/ui/badge';
import * as Lucide from 'lucide-react';
import {PromptReveal} from '@/components/prompts/prompt-reveal';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';

export default async function PromptPage({params}: {params: {id: string}}) {
  const session = await getSession();

  const prompt = prompts.find(p => p.id === params.id);
  if (!prompt) {
    notFound();
  }

  const category = categories.find(c => c.id === prompt.categoryId);
  const image = PlaceHolderImages.find(i => i.id === prompt.imageId);
  const submitter = prompt.submittedBy ? users.find(u => u.id === prompt.submittedBy) : null;

  const CategoryIcon = category ? (Lucide[category.icon] as Lucide.LucideIcon) : Lucide.AlertCircle;

  const fullPrompt: FullPrompt & {submittedBy?: {name: string}} = {
    ...prompt,
    category: category || {id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle'},
    imageUrl: image?.imageUrl || 'https://placehold.co/600x400',
    imageHint: image?.imageHint || 'placeholder',
    submittedBy: submitter ? {name: submitter.name} : undefined,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session} />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-4">
             <Button asChild variant="ghost" className="-ml-4">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] relative">
              <Image
                src={fullPrompt.imageUrl}
                alt={fullPrompt.text}
                fill
                className="rounded-lg object-cover"
                data-ai-hint={fullPrompt.imageHint}
              />
            </div>
            <div className="flex flex-col space-y-4">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 self-start"
              >
                <CategoryIcon className="h-4 w-4" />
                {fullPrompt.category.name}
              </Badge>

              <div>
                <h1 className="font-headline text-3xl font-semibold">Prompt Details</h1>
                {fullPrompt.submittedBy && (
                  <p className="text-muted-foreground">
                    Submitted by {fullPrompt.submittedBy.name}
                  </p>
                )}
              </div>

              <PromptReveal promptText={fullPrompt.text} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
