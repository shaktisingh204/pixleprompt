
'use server';

import {z} from 'zod';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {suggestNewPrompts} from '@/ai/flows/suggest-new-prompts';
import type {SuggestNewPromptsOutput} from '@/ai/flows/suggest-new-prompts';
import dbConnect, {Prompt, PromptModel, CategoryModel, PlaceholderImageModel, AdCode, AdCodeModel} from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { createSession, deleteSession } from './auth';

export async function getPromptSuggestions(
  selectedCategories: string[],
  favoritePrompts: string[]
): Promise<SuggestNewPromptsOutput> {
  try {
    const suggestions = await suggestNewPrompts({
      selectedCategories,
      favoritePrompts,
    });
    return suggestions;
  } catch (error) {
    console.error('Error fetching prompt suggestions:', error);
    return {suggestedPrompts: []};
  }
}

const submitPromptSchema = z.object({
  text: z.string().min(10, 'Prompt must be at least 10 characters.'),
  categoryId: z.string().min(1, 'Please select a category.'),
  image: z.instanceof(File).refine(file => file.size > 0, 'Image is required.'),
});

export type SubmitPromptState = {
  errors?: {
    text?: string[];
    categoryId?: string[];
    image?: string[];
    server?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitPrompt(
  prevState: SubmitPromptState | undefined,
  formData: FormData
): Promise<SubmitPromptState> {
  try {
    const validatedFields = submitPromptSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields.',
      };
    }

    await dbConnect();
    const {text, categoryId, image} = validatedFields.data;

    const imageId = `img_prompt_${Date.now()}_${uuidv4()}`;

    // Convert image to base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUri = `data:${image.type};base64,${imageBase64}`;

    // Save image to PlaceholderImage collection
    const newImage = new PlaceholderImageModel({
      id: imageId,
      description: `User submission: ${text.substring(0, 30)}`,
      imageUrl: imageDataUri,
      imageHint: "user submission",
    });
    await newImage.save();
    
    const newPromptData: Partial<Prompt> = {
      id: `p-${uuidv4()}`,
      text,
      categoryId,
      imageId: imageId,
      status: 'approved', // Auto-approved
    };
    
    const newPrompt = new PromptModel(newPromptData);
    await newPrompt.save();

    revalidatePath('/');
    revalidatePath('/admin');
    return {success: true, message: 'Prompt submitted successfully!'};
  } catch (error) {
    if (error instanceof Error) {
      return {errors: {server: [error.message]}};
    }
    return {errors: {server: ['Something went wrong.']}};
  }
}

export async function approvePrompt(promptId: string) {
  await dbConnect();
  await PromptModel.findOneAndUpdate({ id: promptId }, { status: 'approved' }, { new: true });
  
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectPrompt(promptId: string) {
  await dbConnect();
  await PromptModel.deleteOne({ id: promptId });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deletePrompt(promptId: string) {
  await dbConnect();
  const prompt = await PromptModel.findOne({ id: promptId });
  if (prompt) {
    // Also delete the associated user-uploaded image
    await PlaceholderImageModel.deleteOne({ id: prompt.imageId });
    await PromptModel.deleteOne({ id: promptId });
  }

  revalidatePath('/admin');
  revalidatePath('/');
}

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
  icon: z.string().min(1, 'Icon is required.'),
});

export type CategoryState = {
  errors?: {
    name?: string[];
    icon?: string[];
    server?: string[];
  };
  message?: string | null;
  success?: boolean;
}

export async function createCategory(prevState: CategoryState | undefined, formData: FormData): Promise<CategoryState> {
    await dbConnect();
    const validatedFields = categorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors
        };
    }
    
    const { name, icon } = validatedFields.data;

    try {
        const newCategory = new CategoryModel({
            id: `cat-${uuidv4()}`,
            name,
            icon,
        });
        await newCategory.save();
        revalidatePath('/admin');
        return { success: true, message: 'Category created successfully.' };
    } catch (error) {
        return { errors: { server: ['Failed to create category.'] } };
    }
}

export async function updateCategory(categoryId: string, prevState: CategoryState | undefined, formData: FormData): Promise<CategoryState> {
    await dbConnect();
    const validatedFields = categorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors
        };
    }
    
    const { name, icon } = validatedFields.data;

    try {
        await CategoryModel.findOneAndUpdate({ id: categoryId }, { name, icon });
        revalidatePath('/admin');
        return { success: true, message: 'Category updated successfully.' };
    } catch (error) {
        return { errors: { server: ['Failed to update category.'] } };
    }
}

export async function deleteCategory(categoryId: string) {
    try {
        await dbConnect();
        await CategoryModel.deleteOne({ id: categoryId });
        await PromptModel.updateMany({ categoryId: categoryId }, { categoryId: 'cat-0' }); // Re-assign prompts to 'Uncategorized'
        revalidatePath('/admin');
        revalidatePath('/');
    } catch (error) {
        console.error("Failed to delete category:", error);
    }
}

const adCodeSchema = z.object({
    code: z.string(),
});

export type AdCodeState = {
    errors?: {
        code?: string[];
        server?: string[];
    };
    message?: string;
    success?: boolean;
}

export async function updateAdCode(adId: string, prevState: AdCodeState | undefined, formData: FormData): Promise<AdCodeState> {
    await dbConnect();
    const validatedFields = adCodeSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        await AdCodeModel.findOneAndUpdate({ id: adId }, { code: validatedFields.data.code });
        revalidatePath('/admin');
        return { success: true, message: 'Ad code updated successfully.' };
    } catch (error) {
        return { errors: { server: ['Failed to update ad code.'] } };
    }
}

export async function getAdCodesForClient(): Promise<Record<string, string>> {
    await dbConnect();
    const adCodes = await AdCodeModel.find().lean().exec() as AdCode[];
    const codeMap: Record<string, string> = {};
    for (const ad of adCodes) {
      codeMap[ad.id] = ad.code;
    }
    return codeMap;
}

export async function toggleFavoritePrompt(promptId: string, decrement: boolean) {
    await dbConnect();
    const updateCount = decrement ? -1 : 1;
  
    await PromptModel.updateOne({ id: promptId }, { $inc: { favoritesCount: updateCount } });
  
    revalidatePath('/');
    revalidatePath(`/prompt/${promptId}`);
}

export async function incrementCopyCount(promptId: string) {
    await dbConnect();
    await PromptModel.updateOne({ id: promptId }, { $inc: { copiesCount: 1 } });
    revalidatePath('/');
    revalidatePath(`/prompt/${promptId}`);
}


// --- AUTH ACTIONS ---

const signInSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export async function signIn(prevState: { error: string } | undefined, formData: FormData) {
    const validatedFields = signInSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: 'Invalid username or password.' };
    }

    const { username, password } = validatedFields.data;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        await createSession();
        redirect('/admin');
    }

    return { error: 'Invalid username or password.' };
}

export async function signOut() {
    await deleteSession();
    redirect('/admin/login');
}
