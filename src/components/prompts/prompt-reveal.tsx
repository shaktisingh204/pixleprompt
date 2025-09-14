'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Card, CardContent} from '@/components/ui/card';
import {Copy} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

type PromptRevealProps = {
  promptText: string;
};

const COUNTDOWN_SECONDS = 5;

export function PromptReveal({promptText}: PromptRevealProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && progress < 100) {
      timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 100 / (COUNTDOWN_SECONDS * 10); // Update every 100ms
          if (newProgress >= 100) {
            clearInterval(timer);
            setIsGenerating(false);
            setIsRevealed(true);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isGenerating, progress]);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setProgress(0);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  if (isRevealed) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <p className="text-lg font-mono">{promptText}</p>
            <Button variant="ghost" size="icon" onClick={handleCopyClick}>
              <Copy className="h-5 w-5" />
              <span className="sr-only">Copy prompt</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-4 text-center">
        <p>Generating your prompt...</p>
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          {Math.round(COUNTDOWN_SECONDS - (progress / 100) * COUNTDOWN_SECONDS)}s remaining
        </p>
      </div>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleGenerateClick}>
      Generate Prompt
    </Button>
  );
}
