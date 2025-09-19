
'use client';

import {useState, useMemo, useEffect} from 'react';
import type {FullPrompt, Category} from '@/lib/definitions';
import {CategoryFilters} from './category-filters';
import {PromptCard} from './prompt-card';
import { AdBanner } from '../ad-banner';

type PromptDashboardProps = {
  initialPrompts: FullPrompt[];
  allCategories: Category[];
};

export function PromptDashboard({initialPrompts, allCategories}: PromptDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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
    if (selectedCategory) {
      return initialPrompts.filter(p => p.categoryId === selectedCategory);
    }
    return initialPrompts;
  }, [initialPrompts, selectedCategory]);

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
              return <AdBanner adId="native-prompt-grid" key={`ad-${index}`} className="aspect-[4/5] h-auto my-0" />
            }
            const prompt = item as FullPrompt;

            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
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
