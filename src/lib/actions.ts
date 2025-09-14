
'use server';

import {z} from 'zod';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {signIn, signOut, signUp} from '@/lib/auth';
import {suggestNewPrompts} from '@/ai/flows/suggest-new-prompts';
import type {SuggestNewPromptsOutput} from '@/ai/flows/suggest-new-prompts';

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
