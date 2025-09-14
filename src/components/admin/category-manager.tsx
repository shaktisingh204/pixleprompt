'use client';
import type { Category } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash, PlusCircle } from 'lucide-react';

type CategoryManagerProps = {
  categories: Category[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} in the system.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                action={createCategory}
                onSuccess={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.filter(c => c.id !== 'cat-0').map(category => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12">
              <p>No categories found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if(confirm(`Are you sure you want to delete the category "${category.name}"? All prompts within will be uncategorized.`)) {
      await deleteCategory(category.id);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>{category.icon}</TableCell>
      <TableCell className="text-right space-x-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category: {category.name}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              action={updateCategory.bind(null, category.id)}
              initialData={category}
              onSuccess={() => setEditDialogOpen(false)}
              submitButtonText="Update Category"
            />
          </DialogContent>
        </Dialog>

        <Button size="icon" variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CategoryForm({ action, initialData, onSuccess, submitButtonText = "Create Category" }: {
  action: (prevState: any, formData: FormData) => Promise<any>,
  initialData?: Category | null,
  onSuccess: () => void,
  submitButtonText?: string
}) {
  const [state, dispatch] = useFormState(action, { success: false, errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Success!", description: state.message });
      onSuccess();
      formRef.current?.reset();
    } else if (state.errors?.server) {
      toast({ title: "Error", description: state.errors.server.join(', '), variant: "destructive" });
    }
  }, [state, toast, onSuccess]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name || ''} />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Lucide Icon Name</Label>
        <Input id="icon" name="icon" defaultValue={initialData?.icon || ''} placeholder="e.g., Palette" />
        {state.errors?.icon && <p className="text-sm text-destructive">{state.errors.icon.join(', ')}</p>}
      </div>
      <DialogFooter>
        <SubmitButton text={submitButtonText}/>
      </DialogFooter>
    </form>
  );
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : text}</Button>;
}
