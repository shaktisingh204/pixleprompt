
'use client';

import {useState, useMemo} from 'react';
import type {FullPrompt, Category, User} from '@/lib/definitions';
import {CategoryFilters} from './category-filters';
import {PromptCard} from './prompt-card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type PromptDashboardProps = {
  initialPrompts: FullPrompt[];
  allCategories: Category[];
  user: User | null;
};

export function PromptDashboard({initialPrompts, allCategories, user}: PromptDashboardProps) {
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

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="my-4">
                <CategoryFilters
                categories={categoryCounts}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                />
            </div>
          </ScrollArea>
          <TabsContent value="all">
            {filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isFavorite={favoritePromptIds.has(prompt.id)}
                    onToggleFavorite={toggleFavorite}
                    isUserLoggedIn={!!user}
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
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isFavorite={favoritePromptIds.has(prompt.id)}
                    onToggleFavorite={toggleFavorite}
                    isUserLoggedIn={!!user}
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
