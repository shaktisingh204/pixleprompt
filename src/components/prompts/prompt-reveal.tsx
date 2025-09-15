
'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Card, CardContent} from '@/components/ui/card';
import {Copy} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

type PromptRevealProps = {
  promptText: string;
};

const COUNTDOWN_SECONDS = 5;

export function PromptReveal({promptText}: PromptRevealProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
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
    setShowRewardedAd(true);
  };
  
  const handleAdWatchedAndGenerate = () => {
    setShowRewardedAd(false);
    setIsGenerating(true);
    setProgress(0);
  };

  const handleCopyClick = () => {
    setShowInterstitialAd(true);
  };
  
  const handleAdWatchedAndCopy = () => {
    setShowInterstitialAd(false);
    navigator.clipboard.writeText(promptText);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <>
        <AlertDialog open={showRewardedAd} onOpenChange={setShowRewardedAd}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Watch a Rewarded Ad</AlertDialogTitle>
                <AlertDialogDescription>
                    This is a simulation of a rewarded ad. Watch the "ad" to generate your prompt.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-center justify-center w-full h-48 bg-muted border border-dashed rounded-lg my-4">
                    <span className="text-muted-foreground text-sm">Rewarded Ad Simulation</span>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAdWatchedAndGenerate}>"Ad" Watched & Generate</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showInterstitialAd} onOpenChange={setShowInterstitialAd}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Interstitial Ad</AlertDialogTitle>
                <AlertDialogDescription>
                    This is a simulation of an interstitial ad. Close this to continue.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-center justify-center w-full h-48 bg-muted border border-dashed rounded-lg my-4">
                    <span className="text-muted-foreground text-sm">Interstitial Ad Simulation</span>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAdWatchedAndCopy}>"Ad" Watched & Copy</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {isRevealed ? (
            <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                <p className="text-lg font-mono flex-1">{promptText}</p>
                <Button variant="secondary" size="sm" onClick={handleCopyClick}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </Button>
                </div>
            </CardContent>
            </Card>
        ) : isGenerating ? (
            <div className="space-y-4 text-center">
            <p>Generating your prompt...</p>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
                {Math.round(COUNTDOWN_SECONDS - (progress / 100) * COUNTDOWN_SECONDS)}s remaining
            </p>
            </div>
        ) : (
            <Button size="lg" className="w-full" onClick={handleGenerateClick}>
            Generate Prompt
            </Button>
        )}
    </>
  );
}

