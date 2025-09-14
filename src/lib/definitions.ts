import type {LucideIcon} from 'lucide-react';
import { RowDataPacket } from 'mysql2';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
  role: 'admin' | 'user';
};

export type Category = {
  id:string;
  name: string;
  icon: keyof typeof import('lucide-react').icons;
};

export type Prompt = {
  id: string;
  text: string;
  categoryId: string;
  imageId: string;
  status: 'pending' | 'approved';
  submittedBy?: string;
};

export type FullPrompt = Prompt & {
  category: Category;
  imageUrl: string;
  imageHint: string;
};

export interface UserRow extends User, RowDataPacket {}
export interface CategoryRow extends Category, RowDataPacket {}
export interface PromptRow extends Prompt, RowDataPacket {}
