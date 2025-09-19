
import type {Prompt, Category, AdCode} from '@/lib/definitions';
import dbConnect, { CategoryModel, PromptModel, AdCodeModel } from '@/lib/db';

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

async function getAdCodes(): Promise<AdCode[]> {
    try {
      await dbConnect();
      const adCodes = await AdCodeModel.find().lean().exec();
      return adCodes as AdCode[];
    } catch (error) {
      console.error('Failed to fetch ad codes:', error);
      return [];
    }
  }

export {getCategories, getPrompts, getAdCodes};
