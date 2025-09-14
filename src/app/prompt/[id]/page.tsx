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
import {Separator} from '@/components/ui/separator';

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

  const relatedPrompts: FullPrompt[] = prompts
    .filter(p => p.categoryId === fullPrompt.categoryId && p.id !== fullPrompt.id)
    .slice(0, 3) // Get up to 3 related prompts
    .map(p => {
      const pCategory = categories.find(c => c.id === p.categoryId);
      const pImage = PlaceHolderImages.find(i => i.id === p.imageId);
      return {
        ...p,
        category: pCategory || {id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle'},
        imageUrl: pImage?.imageUrl || 'https://placehold.co/600x400',
        imageHint: pImage?.imageHint || 'placeholder',
      };
    });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-[4/3] relative">
              <Image
                src={fullPrompt.imageUrl}
                alt={fullPrompt.text}
                fill
                className="rounded-lg object-cover shadow-lg"
                data-ai-hint={fullPrompt.imageHint}
              />
            </div>
            <div className="flex flex-col space-y-6">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 self-start text-base py-1 px-3"
              >
                <CategoryIcon className="h-4 w-4" />
                {fullPrompt.category.name}
              </Badge>

              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                  Prompt Details
                </h1>
                {fullPrompt.submittedBy && (
                  <p className="text-lg text-muted-foreground">
                    Submitted by {fullPrompt.submittedBy.name}
                  </p>
                )}
              </div>

              <PromptReveal promptText={fullPrompt.text} />
            </div>
          </div>
          {relatedPrompts.length > 0 && (
            <div className="mt-16">
              <Separator className="my-8" />
              <h2 className="font-headline text-3xl font-semibold mb-6">Related Prompts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedPrompts.map(relatedPrompt => (
                  <Link
                    key={relatedPrompt.id}
                    href={`/prompt/${relatedPrompt.id}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                  >
                    <Image
                      src={relatedPrompt.imageUrl}
                      alt={relatedPrompt.text}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={relatedPrompt.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <p className="font-semibold">{relatedPrompt.category.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
