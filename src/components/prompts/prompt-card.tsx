import Image from 'next/image';
import type {FullPrompt} from '@/lib/definitions';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Heart, Copy} from 'lucide-react';
import {cn} from '@/lib/utils';
import * as Lucide from 'lucide-react';
import {useEffect, useState} from 'react';
import Link from 'next/link';

type PromptCardProps = {
  prompt: FullPrompt;
  isFavorite: boolean;
  onToggleFavorite: (promptId: string) => void;
};

export function PromptCard({prompt, isFavorite, onToggleFavorite}: PromptCardProps) {
  const CategoryIcon = Lucide[prompt.category.icon] as Lucide.LucideIcon;

  const [counts, setCounts] = useState({favorites: 0, copies: 0});

  useEffect(() => {
    // Generate random counts only on the client-side to avoid hydration errors
    setCounts({
      favorites: Math.floor(Math.random() * 2000) + 100,
      copies: Math.floor(Math.random() * 5000) + 200,
    });
  }, []);

  return (
    <Link href={`/prompt/${prompt.id}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg">
      <Image
        src={prompt.imageUrl}
        alt={prompt.text}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={prompt.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 bg-white/20 text-white backdrop-blur-sm"
          >
            {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
            {prompt.category.name}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="group/heart z-10 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(prompt.id)
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-all group-hover/heart:text-accent',
                isFavorite && 'fill-accent text-accent'
              )}
            />
          </Button>
        </div>

        <div className="flex w-full items-center justify-end gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span>{(counts.favorites / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Copy className="h-4 w-4" />
            <span>{(counts.copies / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
