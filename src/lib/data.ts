
import type {Prompt, Category, User} from '@/lib/definitions';
import dbConnect, { UserModel, CategoryModel, PromptModel } from '@/lib/db';

async function getUsers(): Promise<User[]> {
  try {
    await dbConnect();
    const users = await UserModel.find().lean().exec();
    return users as User[];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    await dbConnect();
    const categories = await CategoryModel.find().lean().exec();
    return categories as Category[];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

async function getPrompts(): Promise<Prompt[]> {
  try {
    await dbConnect();
    const prompts = await PromptModel.find().sort({ createdAt: -1 }).lean().exec();
    return prompts as Prompt[];
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return [];
  }
}

export {getUsers, getCategories, getPrompts};

