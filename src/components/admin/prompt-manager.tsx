'use client';
import type { FullPrompt } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { deletePrompt } from '@/lib/actions';
import { useTransition } from 'react';

type PromptManagerProps = {
  prompts: (FullPrompt & { submittedBy?: string })[];
};

export function PromptManager({ prompts }: PromptManagerProps) {
  let [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, text: string) => {
    if (confirm(`Are you sure you want to delete the prompt: "${text}"?`)) {
      startTransition(() => {
        deletePrompt(id);
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Manage All Prompts</CardTitle>
          <CardDescription>
            {prompts.length} prompt{prompts.length === 1 ? '' : 's'} in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prompts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Prompt Text</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map(prompt => (
                  <TableRow key={prompt.id}>
                    <TableCell>
                      <Image
                        src={prompt.imageUrl}
                        alt={prompt.text}
                        width={100}
                        height={66}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{prompt.text}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{prompt.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={prompt.status === 'approved' ? 'default' : 'outline'}>
                        {prompt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(prompt.id, prompt.text)}
                        disabled={isPending}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="font-headline text-xl font-medium tracking-tight">
                No prompts found
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no prompts in the system yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
