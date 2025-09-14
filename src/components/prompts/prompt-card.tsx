import Image from 'next/image';
import type {FullPrompt} from '@/lib/definitions';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Heart} from 'lucide-react';
import {cn} from '@/lib/utils';
import * as Lucide from 'lucide-react';

type PromptCardProps = {
  prompt: FullPrompt;
  isFavorite: boolean;
  onToggleFavorite: (promptId: string) => void;
};

export function PromptCard({prompt, isFavorite, onToggleFavorite}: PromptCardProps) {
  const CategoryIcon = Lucide[prompt.category.icon] as Lucide.LucideIcon;

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-lg">
      <Image
        src={prompt.imageUrl}
        alt={prompt.text}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={prompt.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-4 text-white">
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
            className="group/heart rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            onClick={() => onToggleFavorite(prompt.id)}
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
        <p className="mt-4 text-sm font-medium">{prompt.text}</p>
      </div>
    </div>
  );
}
