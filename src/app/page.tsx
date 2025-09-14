import {getSession} from '@/lib/auth';
import {getPrompts, getCategories} from '@/lib/data';
import {getPlaceholderImages} from '@/lib/placeholder-images';
import type {FullPrompt} from '@/lib/definitions';
import {PromptDashboard} from '@/components/prompts/prompt-dashboard';

export default async function Home() {
  const user = await getSession();

  const [prompts, categories, placeholderImages] = await Promise.all([
    getPrompts(),
    getCategories(),
    getPlaceholderImages()
  ]);

  const imageMap = new Map(placeholderImages.map(img => [img.id, img]));
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const approvedPrompts = prompts.filter(p => p.status === 'approved');

  const fullPrompts: FullPrompt[] = approvedPrompts.map(prompt => {
    const category = categoryMap.get(prompt.categoryId);
    const image = imageMap.get(prompt.imageId);
    return {
      ...prompt,
      category: category || {id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle'},
      imageUrl: image?.imageUrl || 'https://placehold.co/600x400',
      imageHint: image?.imageHint || 'placeholder',
    };
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="font-headline text-3xl font-semibold">Prompt Library</h1>
          <p className="text-muted-foreground">
            Browse, filter, and find your next spark of inspiration.
          </p>
        </div>
        <PromptDashboard
          initialPrompts={fullPrompts}
          allCategories={categories}
          user={user}
        />
      </main>
    </div>
  );
}
