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
});

const PlaceholderImageSchema = new Schema<ImagePlaceholder>({
    id: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
});

export const UserModel = models.User || model<User>('User', UserSchema);
export const CategoryModel = models.Category || model<Category>('Category', CategorySchema);
export const PromptModel = models.Prompt || model<Prompt>('Prompt', PromptSchema);
export const PlaceholderImageModel = models.PlaceholderImage || model<ImagePlaceholder>('PlaceholderImage', PlaceholderImageSchema);

export { User, Category, Prompt, ImagePlaceholder };


async function seedData() {
    try {
        const userCount = await UserModel.countDocuments();
        if (userCount === 0) {
            await UserModel.insertMany([
                { id: 'user-1', name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
                { id: 'user-2', name: 'Regular User', email: 'user@example.com', password: 'password123', role: 'user' },
            ]);
        }

        const categoryCount = await CategoryModel.countDocuments();
        if (categoryCount === 0) {
            await CategoryModel.insertMany([
                { id: 'cat-1', name: 'Art', icon: 'Palette' },
                { id: 'cat-2', name: 'Writing', icon: 'PenTool' },
                { id: 'cat-3', name: 'Photography', icon: 'Camera' },
                { id: 'cat-4', name: 'Music', icon: 'Music' },
                { id: 'cat-5', name: 'Development', icon: 'Code' },
            ]);
        }

        const imageCount = await PlaceholderImageModel.countDocuments();
        if (imageCount === 0) {
            await PlaceholderImageModel.insertMany([
                { id: 'img_prompt_1', description: 'A futuristic cityscape', imageUrl: 'https://picsum.photos/seed/prompt1/600/400', imageHint: 'futuristic cityscape' },
                { id: 'img_prompt_2', description: 'A serene forest path', imageUrl: 'https://picsum.photos/seed/prompt2/600/400', imageHint: 'forest path' },
                { id: 'img_prompt_3', description: 'A cup of coffee', imageUrl: 'https://picsum.photos/seed/prompt3/600/400', imageHint: 'coffee cup' },
                { id: 'img_prompt_4', description: 'An astronaut in space', imageUrl: 'https://picsum.photos/seed/prompt4/600/400', imageHint: 'astronaut space' },
                { id: 'img_prompt_5', description: 'A vintage record player', imageUrl: 'https://picsum.photos/seed/prompt5/600/400', imageHint: 'record player' },
                { id: 'img_prompt_6', description: 'A classic muscle car', imageUrl: 'https://picsum.photos/seed/prompt6/600/400', imageHint: 'muscle car' },
            ]);
        }

        const promptCount = await PromptModel.countDocuments();
        if (promptCount === 0) {
            await PromptModel.insertMany([
                { id: 'p-1', text: 'A futuristic cityscape at dusk, with flying vehicles and holographic ads, in the style of Blade Runner.', categoryId: 'cat-1', imageId: 'img_prompt_1', status: 'approved', submittedBy: 'user-1' },
                { id: 'p-2', text: 'Compose a blog post titled "5 Tips for More Productive Mornings" aimed at young professionals.', categoryId: 'cat-2', imageId: 'img_prompt_2', status: 'approved', submittedBy: 'user-2' },
                { id: 'p-3', text: 'A close-up shot of a vintage camera on a wooden table, with soft, warm lighting.', categoryId: 'cat-3', imageId: 'img_prompt_3', status: 'approved', submittedBy: 'user-1' },
                { id: 'p-4', text: 'Create a lo-fi hip hop track with a melancholic melody and a steady, relaxing beat.', categoryId: 'cat-4', imageId: 'img_prompt_4', status: 'approved', submittedBy: 'user-2' },
                { id: 'p-5', text: 'Generate a Python script that automates daily file backups to a cloud storage service.', categoryId: 'cat-5', imageId: 'img_prompt_5', status: 'approved', submittedBy: 'user-1' },
                { id: 'p-6', text: 'Design a minimalist logo for a new tech startup called "Innovate".', categoryId: 'cat-1', imageId: 'img_prompt_6', status: 'approved', submittedBy: 'user-2' },
            ]);
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}


export default dbConnect;
