import type {LucideIcon} from 'lucide-react';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
};

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof import('lucide-react').icons;
};

export type Prompt = {
  id: string;
  text: string;
  categoryId: string;
  imageId: string;
};

export type FullPrompt = Prompt & {
  category: Category;
  imageUrl: string;
  imageHint: string;
};
