'use client';

import {useState, useMemo} from 'react';
import type {FullPrompt, Category} from '@/lib/definitions';
import {CategoryFilters} from './category-filters';
import {PromptCard} from './prompt-card';
import {PromptSuggestionDialog} from './prompt-suggestion-dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

type PromptDashboardProps = {
  initialPrompts: FullPrompt[];
  allCategories: Category[];
};

export function PromptDashboard({initialPrompts, allCategories}: PromptDashboardProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoritePromptIds, setFavoritePromptIds] = useState<Set<string>>(new Set());

  const toggleFavorite = (promptId: string) => {
    setFavoritePromptIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
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
    if (activeTab === 'favorites') {
      prompts = prompts.filter(p => favoritePromptIds.has(p.id));
    }
    if (selectedCategory) {
      prompts = prompts.filter(p => p.categoryId === selectedCategory);
    }
    return prompts;
  }, [initialPrompts, selectedCategory, favoritePromptIds, activeTab]);

  const favoritePrompts = useMemo(
    () => initialPrompts.filter(p => favoritePromptIds.has(p.id)),
    [initialPrompts, favoritePromptIds]
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <PromptSuggestionDialog
              favoritePrompts={favoritePrompts}
              selectedCategories={
                selectedCategory ? allCategories.filter(c => c.id === selectedCategory) : []
              }
            />
          </div>
          <CategoryFilters
            categories={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <TabsContent value="all">
            {filteredPrompts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isFavorite={favoritePromptIds.has(prompt.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <h3 className="font-headline text-xl font-medium tracking-tight">
                  No prompts found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or adding some prompts to your favorites.
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="favorites">
            {filteredPrompts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isFavorite={favoritePromptIds.has(prompt.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <h3 className="font-headline text-xl font-medium tracking-tight">
                  No prompts found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adding some prompts to your favorites.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}