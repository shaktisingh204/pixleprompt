
import Image from 'next/image';
import type {FullPrompt} from '@/lib/definitions';
import {Button} from '@/components/ui/button';
import {Copy} from 'lucide-react';
import Link from 'next/link';

type PromptCardProps = {
  prompt: FullPrompt;
};

export function PromptCard({
  prompt
}: PromptCardProps) {

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };

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
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">

        <div className="flex w-full items-center justify-end gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Copy className="h-4 w-4" />
            <span>{formatCount(prompt.copiesCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
