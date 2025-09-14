import Image from 'next/image';
import type {FullPrompt} from '@/lib/definitions';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
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
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={prompt.imageUrl}
            alt={prompt.text}
            fill
            className="object-cover"
            data-ai-hint={prompt.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="font-body text-base text-foreground">{prompt.text}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Badge variant="secondary" className="flex items-center gap-1.5">
          {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
          {prompt.category.name}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="group rounded-full"
          onClick={() => onToggleFavorite(prompt.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'h-5 w-5 text-muted-foreground transition-all group-hover:text-accent',
              isFavorite && 'fill-accent text-accent'
            )}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
