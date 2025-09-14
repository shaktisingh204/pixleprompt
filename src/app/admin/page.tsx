import {getSession} from '@/lib/auth';
import {getPrompts, getCategories, getUsers} from '@/lib/data';
import {Header} from '@/components/layout/header';
import {AdminDashboard} from '@/components/admin/admin-dashboard';
import type {FullPrompt} from '@/lib/definitions';

export default async function AdminPage() {
  const user = await getSession();

  const [prompts, categories, users] = await Promise.all([
    getPrompts(),
    getCategories(),
    getUsers(),
  ]);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const userMap = new Map(users.map(u => [u.id, u]));

  const pendingPrompts: (FullPrompt & {submittedBy?: string})[] = prompts
    .filter(p => p.status === 'pending')
    .map(prompt => {
      const category = categoryMap.get(prompt.categoryId);
      const submitter = prompt.submittedBy ? userMap.get(prompt.submittedBy) : undefined;
      return {
        ...prompt,
        category: category || {id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle'},
        imageUrl: 'https://placehold.co/600x400', // Placeholder as image isn't saved yet
        imageHint: 'user submission',
        submittedBy: submitter?.name || 'Unknown',
      };
    });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="font-headline text-3xl font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">Review and approve user-submitted prompts.</p>
        </div>
        <AdminDashboard prompts={pendingPrompts} />
      </main>
    </div>
  );
}
