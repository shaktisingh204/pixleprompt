
'use client';

import type {Category} from '@/lib/definitions';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import * as Lucide from 'lucide-react';

type CategoryFiltersProps = {
  categories: (Category & {promptCount: number})[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export function CategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFiltersProps) {
  const totalPrompts = categories.reduce((sum, cat) => sum + cat.promptCount, 0);

  const getIcon = (iconName: Category['icon'], isActive: boolean) => {
    const Icon = Lucide[iconName] as Lucide.LucideIcon;
    return Icon ? (
      <Icon
        className={cn(
          'mr-2 h-4 w-4 text-accent transition-colors group-hover:text-primary',
          isActive && 'text-primary'
        )}
      />
    ) : null;
  };

  const allItems = [{id: null, name: 'All', promptCount: totalPrompts, icon: 'LayoutGrid' as const}, ...categories];

  return (
    <div className="flex space-x-2 whitespace-nowrap">
      {allItems.map(item => {
        const isActive = selectedCategory === item.id;
        const isAllButton = item.id === null;
        return (
            <Button
              key={item.id || 'all'}
              variant="ghost"
              onClick={() => onSelectCategory(item.id)}
              className={cn(
                'group h-auto py-2 px-4',
                isActive ? 'bg-primary/10 text-primary' : ''
              )}
            >
              {!isAllButton && getIcon(item.icon, isActive)}
              {item.name}
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {item.promptCount}
              </span>
            </Button>
        );
      })}
    </div>
  );
}
