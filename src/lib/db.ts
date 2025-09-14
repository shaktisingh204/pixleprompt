import mongoose, { Schema, model, models } from 'mongoose';
import type { User, Category, Prompt } from '@/lib/definitions';
import { ImagePlaceholder } from './placeholder-images';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

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

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  await seedData();
  return cached.conn;
}


const UserSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true, default: 'user' },
});

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
  submittedBy: { type: String, ref: 'User' },
}, { timestamps: true });

const PlaceholderImageSchema = new Schema<ImagePlaceholder>({
    id: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    uploadedBy: { type: String, ref: 'User', required: false },
});

export const UserModel = models.User || model<User>('User', UserSchema);
export const CategoryModel = models.Category || model<Category>('Category', CategorySchema);
export const PromptModel = models.Prompt || model<Prompt>('Prompt', PromptSchema);
export const PlaceholderImageModel = models.PlaceholderImage || model<ImagePlaceholder>('PlaceholderImage', PlaceholderImageSchema);

export { User, Category, Prompt, ImagePlaceholder };


async function seedData() {
    try {
        const uncategorizedCategory = await CategoryModel.findOne({ id: 'cat-0' });
        if (!uncategorizedCategory) {
            await CategoryModel.create({ id: 'cat-0', name: 'Uncategorized', icon: 'AlertCircle'});
        }
    } catch (error) {
        console.error("Error seeding essential data:", error);
    }
}


export default dbConnect;

    