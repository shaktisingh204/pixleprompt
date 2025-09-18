
'use client';

import {useState, useMemo, useEffect} from 'react';
import type {FullPrompt, Category, User} from '@/lib/definitions';
import {CategoryFilters} from './category-filters';
import {PromptCard} from './prompt-card';
import { AdBanner } from '../ad-banner';
import { toggleFavoritePrompt } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type PromptDashboardProps = {
  initialPrompts: FullPrompt[];
  allCategories: Category[];
  user: User | null;
};

export function PromptDashboard({initialPrompts, allCategories, user}: PromptDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [optimisticFavorites, setOptimisticFavorites] = useState<Record<string, {isFavorite: boolean, count: number}>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the optimistic state from the initial prompts
    const initialFavorites: Record<string, {isFavorite: boolean, count: number}> = {};
    initialPrompts.forEach(p => {
        initialFavorites[p.id] = { isFavorite: false, count: p.favoritesCount };
    });
    setOptimisticFavorites(initialFavorites);
  }, [initialPrompts]);


  const handleToggleFavorite = async (promptId: string) => {
    const currentStatus = optimisticFavorites[promptId] || { isFavorite: false, count: 0 };
    const newIsFavorite = !currentStatus.isFavorite;
    const newCount = currentStatus.count + (newIsFavorite ? 1 : -1);

    // Optimistically update the UI
    setOptimisticFavorites(prev => ({
        ...prev,
        [promptId]: {
            isFavorite: newIsFavorite,
            count: newCount,
        }
    }));
    
    try {
        await toggleFavoritePrompt(promptId, currentStatus.isFavorite);
    } catch (error) {
        // Revert the optimistic update on error
        setOptimisticFavorites(prev => ({
            ...prev,
            [promptId]: currentStatus
        }));
        toast({ title: "Error", description: "Could not update favorite status. Please try again.", variant: 'destructive' });
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: {[key: string]: number} = {};
    for (const category of allCategories) {
      counts[category.id] = 0;
    }
    for (const prompt of initialPrompts) {
      if (counts[prompt.categoryId] !== undefined) {
        counts[prompt.categoryId]++;
      }
    }
    return allCategories.map(cat => ({...cat, promptCount: counts[cat.id] || 0}));
  }, [initialPrompts, allCategories]);

  const filteredPrompts = useMemo(() => {
    let prompts = initialPrompts;
    if (selectedCategory) {
      prompts = prompts.filter(p => p.categoryId === selectedCategory);
    }
    // Update prompts with optimistic counts
    return prompts.map(p => ({
        ...p,
        favoritesCount: optimisticFavorites[p.id]?.count ?? p.favoritesCount,
    }));
  }, [initialPrompts, selectedCategory, optimisticFavorites]);

  const promptsWithAds = useMemo(() => {
    const items: (FullPrompt | 'ad')[] = [];
    for (let i = 0; i < filteredPrompts.length; i++) {
      items.push(filteredPrompts[i]);
      if ((i + 1) % 3 === 0) {
        items.push('ad');
      }
    }
    return items;
  }, [filteredPrompts]);


  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto py-4 no-scrollbar">
        <CategoryFilters
            categories={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
        />
      </div>

      {promptsWithAds.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {promptsWithAds.map((item, index) => {
            if(item === 'ad') {
              return <AdBanner adId="native-prompt-grid" key={`ad-${index}`} className="aspect-[3/4] h-auto my-0" />
            }
            const prompt = item as FullPrompt;
            const favoriteStatus = optimisticFavorites[prompt.id] || { isFavorite: false, count: prompt.favoritesCount };

            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isFavorite={favoriteStatus.isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="font-headline text-xl font-medium tracking-tight">
            No prompts found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
