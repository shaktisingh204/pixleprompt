import type {LucideIcon} from 'lucide-react';
import type { Document } from 'mongoose';

export interface User extends Document {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
  role: 'admin' | 'user';
};

export interface Category extends Document {
  id:string;
  name: string;
  icon: keyof typeof import('lucide-react').icons;
};

export interface Prompt extends Document {
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

export interface AdCode extends Document {
  id: string;
  name: string;
  code: string;
  type: 'banner' | 'interstitial' | 'rewarded';
}
