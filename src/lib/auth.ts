
'use server';

import {cookies} from 'next/headers';
import type {User} from '@/lib/definitions';
import {UserModel} from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session';


export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const user = await UserModel.findOne({ email: sessionCookie }).lean().exec();
    return (user as User) || null;
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return null;
  }
}

export async function signIn(email: string, password_input: string): Promise<void> {
  const user = await UserModel.findOne({ email: email }).lean().exec();

  if (!user || user.password !== password_input) {
    throw new Error('CredentialsSignin');
  }

  cookies().set(SESSION_COOKIE_NAME, user.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function signUp(name: string, email: string, password_input: string): Promise<void> {
    const existingUser = await UserModel.findOne({ email: email }).lean().exec();
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const userCount = await UserModel.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const newUser = new UserModel({
        id: `user-${uuidv4()}`,
        name,
        email,
        password: password_input, // In a real app, hash this password
        role,
    });

    await newUser.save();

    await signIn(email, password_input);
}

export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}
