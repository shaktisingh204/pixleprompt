
import { getCategories, getPrompts, getAdCodes } from '@/lib/data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { FullPrompt } from '@/lib/definitions';
import { getPlaceholderImages } from '@/lib/placeholder-images';
import { CategoryManager } from '@/components/admin/category-manager';
import { PromptManager } from '@/components/admin/prompt-manager';
import { Separator } from '@/components/ui/separator';
import { AdManager } from '@/components/admin/ad-manager';
import { SubmitPromptForm } from '@/components/prompts/submit-prompt-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function AdminPage() {
  const [prompts, categories, placeholderImages, adCodes] = await Promise.all([
    getPrompts(),
    getCategories(),
    getPlaceholderImages(),
    getAdCodes(),
  ]);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const imageMap = new Map(placeholderImages.map(img => [img.id, img]));

  const fullPrompts: (FullPrompt & { submittedBy?: string })[] = prompts.map(prompt => {
    const category = categoryMap.get(prompt.categoryId);
    const image = imageMap.get(prompt.imageId);
    return {
      ...prompt,
      category: category || { id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle' },
      imageUrl: image?.imageUrl || 'https://placehold.co/600x400',
      imageHint: image?.imageHint || 'user submission',
      submittedBy: 'Public',
    };
  });

  const pendingPrompts = fullPrompts.filter(p => p.status === 'pending');
  const allPromptsForTable = fullPrompts;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="font-headline text-3xl font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage prompts, categories, and ad codes.</p>
        </div>

        <AdminDashboard prompts={pendingPrompts} />

        <div className="mx-auto w-full max-w-6xl my-8">
            <Card>
                <CardHeader>
                    <CardTitle>Submit a New Prompt</CardTitle>
                    <CardDescription>
                        Contribute to the community by sharing your own creative prompts. Your submission will be reviewed by an administrator before appearing in the library.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SubmitPromptForm categories={categories} />
                </CardContent>
            </Card>
        </div>

        <AdManager adCodes={adCodes} />
        
        <CategoryManager categories={categories} />

        <Separator className="my-8" />

        <PromptManager prompts={allPromptsForTable} />

      </main>
    </div>
  );
}
