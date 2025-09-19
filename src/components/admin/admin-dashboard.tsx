
'use client';

import type {FullPrompt} from '@/lib/definitions';
import {approvePrompt, rejectPrompt} from '@/lib/actions';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import Image from 'next/image';
import {Check, X} from 'lucide-react';
import {useTransition} from 'react';

type AdminDashboardProps = {
  prompts: (FullPrompt & {submittedBy?: string})[];
};

export function AdminDashboard({prompts}: AdminDashboardProps) {
  let [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(() => {
      approvePrompt(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(() => {
      rejectPrompt(id);
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            {prompts.length} prompt{prompts.length === 1 ? '' : 's'} waiting for review. All prompts are auto-approved, so this list should be empty.
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
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map(prompt => (
                  <TableRow key={prompt.id}>
                    <TableCell>
                      <Image
                        src={prompt.imageUrl}
                        alt="User submission"
                        width={100}
                        height={66}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{prompt.text}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{prompt.category.name}</Badge>
                    </TableCell>
                    <TableCell>{'Public'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-500/50"
                        onClick={() => handleApprove(prompt.id)}
                        disabled={isPending}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleReject(prompt.id)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Reject</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="font-headline text-xl font-medium tracking-tight">
                All caught up!
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no pending prompts to review.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
