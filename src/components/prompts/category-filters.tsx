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

  const getIcon = (iconName: Category['icon']) => {
    const Icon = Lucide[iconName] as Lucide.LucideIcon;
    return Icon ? <Icon className="mr-2 h-4 w-4 text-accent" /> : null;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => onSelectCategory(null)}
        className={cn(
          'h-auto py-2 px-4',
          selectedCategory === null ? 'bg-primary/10 text-primary' : ''
        )}
      >
        All
        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {totalPrompts}
        </span>
      </Button>
      {categories.map(category => (
        <Button
          key={category.id}
          variant="ghost"
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'h-auto py-2 px-4',
            selectedCategory === category.id ? 'bg-primary/10 text-primary' : ''
          )}
        >
          {getIcon(category.icon)}
          {category.name}
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {category.promptCount}
          </span>
        </Button>
      ))}
    </div>
  );
}
