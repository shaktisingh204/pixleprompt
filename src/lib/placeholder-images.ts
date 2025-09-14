import { PlaceholderImageModel } from '@/lib/db';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export async function getPlaceholderImages(): Promise<ImagePlaceholder[]> {
  try {
    const images = await PlaceholderImageModel.find().lean().exec();
    return images as ImagePlaceholder[];
  } catch (error) {
    console.error('Failed to fetch placeholder images:', error);
    return [];
  }
}
