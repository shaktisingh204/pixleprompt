
'use server';

import {z} from 'zod';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {getSessionCookie} from '@/lib/auth';
import {signIn, signOut, signUp} from '@/lib/auth-actions';
import {suggestNewPrompts} from '@/ai/flows/suggest-new-prompts';
import type {SuggestNewPromptsOutput} from '@/ai/flows/suggest-new-prompts';
import dbConnect, {Prompt, PromptModel, CategoryModel, PlaceholderImageModel, AdCode, AdCodeModel, UserModel} from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './definitions';


export async function getSession(): Promise<User | null> {
    const sessionCookie = await getSessionCookie();
    if (!sessionCookie) return null;
  
    try {
      await dbConnect();
      const user = await UserModel.findOne({ email: sessionCookie }).lean().exec();
      if (!user) {
          // This case can happen if the user was deleted but the cookie remains.
          await signOut(); // Clear the invalid cookie
          return null;
      }
      // Convert document to plain object and remove password
      const { password, ...userWithoutPassword } = user;
      return JSON.parse(JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
}


const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    server?: string[];
  };
  message?: string | null;
};

export async function authenticate(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  try {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields.',
      };
    }

    await signIn(validatedFields.data.email, validatedFields.data.password);
  } catch (error) {
    if (error instanceof Error && error.message.includes('CredentialsSignin')) {
      return {errors: {server: ['Invalid credentials']}};
    }
    return {errors: {server: ['Something went wrong.']}};
  }
  revalidatePath('/');
  redirect('/');
}

export type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    server?: string[];
  };
  message?: string | null;
};

export async function register(
  prevState: SignupState | undefined,
  formData: FormData
): Promise<SignupState | undefined> {
  try {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields.',
      };
    }
    const {name, email, password} = validatedFields.data;

    await signUp(name, email, password);
  } catch (error) {
    if (error instanceof Error) {
      return {errors: {server: [error.message]}};
    }
    return {errors: {server: ['Something went wrong.']}};
  }

  revalidatePath('/');
  redirect('/');
}

export async function logout() {
  await signOut();
  revalidatePath('/login');
  redirect('/login');
}

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
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      throw new Error('You must be an admin to submit a prompt.');
    }

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
      uploadedBy: session.id,
    });
    await newImage.save();
    
    const newPromptData: Partial<Prompt> = {
      id: `p-${uuidv4()}`,
      text,
      categoryId,
      imageId: imageId,
      status: 'approved',
      submittedBy: session.id,
    };
    
    const newPrompt = new PromptModel(newPromptData);
    await newPrompt.save();

    // Send OneSignal notification
    if (process.env.ONESIGNAL_REST_API_KEY) {
      try {
          await fetch('https://onesignal.com/api/v1/notifications', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
              },
              body: JSON.stringify({
                  app_id: "c3c64ad1-60bb-47b5-a35f-440438172e0d",
                  included_segments: ['Subscribed Users'],
                  headings: { en: 'New Prompt Added! ✨' },
                  contents: { en: `A new creative prompt is ready: "${newPrompt.text.substring(0, 50)}..."` },
                  web_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/prompt/${newPrompt.id}`
              }),
          });
      } catch (notificationError) {
          console.error('OneSignal notification failed:', notificationError);
      }
    }


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
  const session = await getSession();
  if (session?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await dbConnect();
  const prompt = await PromptModel.findOneAndUpdate({ id: promptId }, { status: 'approved' }, { new: true });
  
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectPrompt(promptId: string) {
  const session = await getSession();
  if (session?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  await dbConnect();
  await PromptModel.deleteOne({ id: promptId });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deletePrompt(promptId: string) {
  const session = await getSession();
  if (session?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  await dbConnect();
  const prompt = await PromptModel.findOne({ id: promptId });
  if (prompt) {
    // Also delete the associated user-uploaded image
    const image = await PlaceholderImageModel.findOne({ id: prompt.imageId });
    if (image && image.uploadedBy) {
        await PlaceholderImageModel.deleteOne({ id: prompt.imageId });
    }
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
    const session = await getSession();
    if (session?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
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
    const session = await getSession();
    if (session?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
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
    const session = await getSession();
    if (session?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

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
    const session = await getSession();
    if (session?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
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

export async function toggleFavoritePrompt(promptId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await dbConnect();
  const user = await UserModel.findOne({ id: session.id });
  if (!user) {
    throw new Error('User not found');
  }

  const isFavorite = user.favoritePrompts?.includes(promptId);
  let updateCount;

  if (isFavorite) {
    user.favoritePrompts = user.favoritePrompts?.filter(id => id !== promptId);
    updateCount = -1;
  } else {
    if (!user.favoritePrompts) {
      user.favoritePrompts = [];
    }
    user.favoritePrompts.push(promptId);
    updateCount = 1;
  }

  await user.save();
  await PromptModel.updateOne({ id: promptId }, { $inc: { favoritesCount: updateCount } });

  revalidatePath('/');
  revalidatePath(`/prompt/${promptId}`);
  
  // Return the new favorite status
  return !isFavorite;
}

export async function incrementCopyCount(promptId: string) {
    await dbConnect();
    await PromptModel.updateOne({ id: promptId }, { $inc: { copiesCount: 1 } });
    revalidatePath(`/prompt/${promptId}`);
}
