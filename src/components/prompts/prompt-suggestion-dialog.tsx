'use client';

import {useState} from 'react';
import type {FullPrompt, Category} from '@/lib/definitions';
import {getPromptSuggestions} from '@/lib/actions';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Badge} from '@/components/ui/badge';
import {Wand2, Loader2, Sparkles} from 'lucide-react';

type PromptSuggestionDialogProps = {
  favoritePrompts: FullPrompt[];
  selectedCategories: Category[];
};

export function PromptSuggestionDialog({
  favoritePrompts,
  selectedCategories,
}: PromptSuggestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const favPromptTexts = favoritePrompts.map(p => p.text);
      const catNames = selectedCategories.map(c => c.name);
      const result = await getPromptSuggestions(catNames, favPromptTexts);
      if (result.suggestedPrompts && result.suggestedPrompts.length > 0) {
        setSuggestions(result.suggestedPrompts);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSuggestions([]);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Wand2 className="mr-2 h-4 w-4" />
          Suggest Prompts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-primary" />
            AI Prompt Suggestions
          </DialogTitle>
          <DialogDescription>
            Get new ideas based on your favorite prompts and selected categories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Based on your favorites:</h4>
            {favoritePrompts.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {favoritePrompts.map(p => (
                  <Badge key={p.id} variant="secondary">
                    {p.text.substring(0, 30)}...
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No favorite prompts selected.</p>
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Based on categories:</h4>
            {selectedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map(c => (
                  <Badge key={c.id} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No category filter applied.</p>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3 mt-4">
              <h4 className="font-medium text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Here are some ideas for you:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
           {suggestions.length === 0 && isLoading === false && (
             <p className="text-sm text-center text-muted-foreground pt-4">Click "Generate" to get started!</p>
           )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
