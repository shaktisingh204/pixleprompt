
import type {LucideIcon} from 'lucide-react';
import type { Document } from 'mongoose';

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
  favoritesCount: number;
  copiesCount: number;
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
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
}
