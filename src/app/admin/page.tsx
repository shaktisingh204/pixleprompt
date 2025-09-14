import { getCategories, getPrompts, getUsers } from '@/lib/data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { FullPrompt } from '@/lib/definitions';
import { getPlaceholderImages } from '@/lib/placeholder-images';
import { CategoryManager } from '@/components/admin/category-manager';
import { PromptManager } from '@/components/admin/prompt-manager';
import { Separator } from '@/components/ui/separator';

export default async function AdminPage() {
  const [prompts, categories, users, placeholderImages] = await Promise.all([
    getPrompts(),
    getCategories(),
    getUsers(),
    getPlaceholderImages(),
  ]);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const userMap = new Map(users.map(u => [u.id, u]));
  const imageMap = new Map(placeholderImages.map(img => [img.id, img]));

  const fullPrompts: (FullPrompt & { submittedBy?: string })[] = prompts.map(prompt => {
    const category = categoryMap.get(prompt.categoryId);
    const submitter = prompt.submittedBy ? userMap.get(prompt.submittedBy) : undefined;
    const image = imageMap.get(prompt.imageId);
    return {
      ...prompt,
      category: category || { id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle' },
      imageUrl: image?.imageUrl || 'https://placehold.co/600x400',
      imageHint: image?.imageHint || 'user submission',
      submittedBy: submitter?.name || 'Unknown',
    };
  });

  const pendingPrompts = fullPrompts.filter(p => p.status === 'pending');
  const allPromptsForTable = fullPrompts;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="font-headline text-3xl font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage prompts and categories.</p>
        </div>

        <AdminDashboard prompts={pendingPrompts} />

        <Separator className="my-8" />
        
        <CategoryManager categories={categories} />

        <Separator className="my-8" />

        <PromptManager prompts={allPromptsForTable} />

      </main>
    </div>
  );
}
