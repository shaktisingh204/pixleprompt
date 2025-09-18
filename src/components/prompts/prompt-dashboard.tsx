
'use client';

import {useState, useMemo, useEffect} from 'react';
import type {FullPrompt, Category} from '@/lib/definitions';
import {CategoryFilters} from './category-filters';
import {PromptCard} from './prompt-card';
import { AdBanner } from '../ad-banner';
import { toggleFavoritePrompt } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const getLikedPrompts = (): Record<string, boolean> => {
    if (typeof window === 'undefined') return {};
    try {
      const liked = window.localStorage.getItem('likedPrompts');
      return liked ? JSON.parse(liked) : {};
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return {};
    }
  };
  
  const setLikedPrompts = (liked: Record<string, boolean>) => {
    try {
      window.localStorage.setItem('likedPrompts', JSON.stringify(liked));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  };

type PromptDashboardProps = {
  initialPrompts: FullPrompt[];
  allCategories: Category[];
};

export function PromptDashboard({initialPrompts, allCategories}: PromptDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, {isLiked: boolean, count: number}>>({});
  const { toast } = useToast();

  useEffect(() => {
    const localLikes = getLikedPrompts();
    const initialLikes: Record<string, {isLiked: boolean, count: number}> = {};
    initialPrompts.forEach(p => {
        initialLikes[p.id] = { isLiked: !!localLikes[p.id], count: p.favoritesCount };
    });
    setOptimisticLikes(initialLikes);
  }, [initialPrompts]);


  const handleToggleLike = async (promptId: string) => {
    const currentStatus = optimisticLikes[promptId] || { isLiked: false, count: 0 };
    const newIsLiked = !currentStatus.isLiked;
    const newCount = currentStatus.count + (newIsLiked ? 1 : -1);

    setOptimisticLikes(prev => ({
        ...prev,
        [promptId]: {
            isLiked: newIsLiked,
            count: newCount,
        }
    }));
    
    const localLikes = getLikedPrompts();
    if (newIsLiked) {
        localLikes[promptId] = true;
    } else {
        delete localLikes[promptId];
    }
    setLikedPrompts(localLikes);

    try {
        await toggleFavoritePrompt(promptId, !newIsLiked); // Pass true to decrement
    } catch (error) {
        setOptimisticLikes(prev => ({
            ...prev,
            [promptId]: currentStatus
        }));
        
        const revertedLikes = getLikedPrompts();
        if (currentStatus.isLiked) {
            revertedLikes[promptId] = true;
        } else {
            delete revertedLikes[promptId];
        }
        setLikedPrompts(revertedLikes);
        
        toast({ title: "Error", description: "Could not update like status. Please try again.", variant: 'destructive' });
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
    return prompts.map(p => ({
        ...p,
        favoritesCount: optimisticLikes[p.id]?.count ?? p.favoritesCount,
    }));
  }, [initialPrompts, selectedCategory, optimisticLikes]);

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
            const likeStatus = optimisticLikes[prompt.id] || { isLiked: false, count: prompt.favoritesCount };

            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isLiked={likeStatus.isLiked}
                onToggleLike={handleToggleLike}
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
