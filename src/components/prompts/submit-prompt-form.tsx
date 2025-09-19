
'use client';

import {useFormState, useFormStatus} from 'react-dom';
import {useEffect, useRef} from 'react';
import {submitPrompt} from '@/lib/actions';
import type {Category} from '@/lib/definitions';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {CheckCircle} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

type SubmitPromptFormProps = {
  categories: Category[];
};

export function SubmitPromptForm({categories}: SubmitPromptFormProps) {
  const [state, dispatch] = useFormState(submitPrompt, undefined);
  const {toast} = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Success!',
        description: state.message,
        variant: 'default',
      });
      formRef.current?.reset();
    } else if (state?.errors?.server) {
      toast({
        title: 'Error',
        description: state.errors.server.join(', '),
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text">Prompt Text</Label>
        <Textarea
          id="text"
          name="text"
          placeholder="e.g., A majestic lion wearing a crown, photorealistic, 4k..."
          required
          rows={5}
        />
        {state?.errors?.text && (
          <p className="text-sm text-destructive">{state.errors.text.join(', ')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.categoryId && (
          <p className="text-sm text-destructive">{state.errors.categoryId.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Inspiration Image</Label>
        <Input id="image" name="image" type="file" required accept="image/*" />
        {state?.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image.join(', ')}</p>
        )}
      </div>

      {state?.success && !state.errors && (
        <Alert
          variant="default"
          className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-700 dark:[&>svg]:text-green-400"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Prompt Submitted!</AlertTitle>
          <AlertDescription>
            Thank you for your contribution. Your prompt has been added to the library.
          </AlertDescription>
        </Alert>
      )}

      {state?.errors?.server && (
         <p className="text-sm text-destructive">{state.errors.server.join(', ')}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Prompt'}
    </Button>
  );
}
