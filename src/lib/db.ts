
import mongoose, { Schema, model, models } from 'mongoose';
import type { Category, Prompt, AdCode } from '@/lib/definitions';
import { ImagePlaceholder } from './placeholder-images';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      await seedData();
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const CategorySchema = new Schema<Category>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

const PromptSchema = new Schema<Prompt>({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  categoryId: { type: String, required: true, ref: 'Category' },
  imageId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], required: true, default: 'pending' },
  favoritesCount: { type: Number, default: 0 },
  copiesCount: { type: Number, default: 0 },
}, { timestamps: true });

const PlaceholderImageSchema = new Schema<ImagePlaceholder>({
    id: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
});

const AdCodeSchema = new Schema<AdCode>({
    id: { type: String, required: true, unique:true },
    name: { type: String, required: true },
    code: { type: String, default: '<div class="flex items-center justify-center w-full h-full bg-muted border border-dashed rounded-lg"><span class="text-muted-foreground text-sm">Ad Placement</span></div>' },
    type: { type: String, enum: ['banner', 'interstitial', 'rewarded', 'native'], required: true },
});

export const CategoryModel = models.Category || model<Category>('Category', CategorySchema);
export const PromptModel = models.Prompt || model<Prompt>('Prompt', PromptSchema);
export const PlaceholderImageModel = models.PlaceholderImage || model<ImagePlaceholder>('PlaceholderImage', PlaceholderImageSchema);
export const AdCodeModel = models.AdCode || model<AdCode>('AdCode', AdCodeSchema);

export type { Category, Prompt, ImagePlaceholder, AdCode };


async function seedData() {
    try {
        const uncategorizedCategory = await (models.Category || model('Category', CategorySchema)).findOne({ id: 'cat-0' });
        if (!uncategorizedCategory) {
            await (models.Category || model('Category', CategorySchema)).create({ id: 'cat-0', name: 'Uncategorized', icon: 'Tag'});
        }

        const adCodeModel = models.AdCode || model('AdCode', AdCodeSchema);
        const adCodeCount = await adCodeModel.countDocuments();
        if(adCodeCount === 0) {
            const defaultAdCode = '<div class="flex items-center justify-center w-full h-full bg-muted border border-dashed rounded-lg my-4"><span class="text-muted-foreground text-sm">Ad Placement</span></div>';
            await adCodeModel.insertMany([
                { id: 'banner-homepage-top', name: 'Homepage Top Banner', type: 'banner', code: defaultAdCode.replace('my-4', '') },
                { id: 'native-prompt-grid', name: 'Prompt Grid Native Ad', type: 'native', code: defaultAdCode.replace('my-4', 'h-full') },
                { id: 'banner-prompt-detail-top', name: 'Prompt Detail Page (Top)', type: 'banner', code: defaultAdCode },
                { id: 'banner-prompt-detail-bottom', name: 'Prompt Detail Page (Bottom)', type: 'banner', code: defaultAdCode },
                { id: 'banner-contact-page', name: 'Contact Page Banner', type: 'banner', code: defaultAdCode },
                { id: 'banner-submit-page', name: 'Submit Prompt Page Banner', type: 'banner', code: defaultAdCode },
                { id: 'banner-footer', name: 'Footer Banner', type: 'banner', code: defaultAdCode },
                { id: 'rewarded-generate-prompt', name: 'Rewarded Ad (Generate Prompt)', type: 'rewarded', code: defaultAdCode },
            ]);
        }
    } catch (error) {
        console.error("Error seeding essential data:", error);
    }
}

export default dbConnect;
