
'use server';

import {cookies} from 'next/headers';
import type {User} from '@/lib/definitions';
import dbConnect, {UserModel} from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session';

export async function signIn(email: string, password_input: string): Promise<void> {
  await dbConnect();
  const user = await UserModel.findOne({ email: email }).exec();

  if (!user || user.password !== password_input || user.role !== 'admin') {
    throw new Error('CredentialsSignin');
  }

  cookies().set(SESSION_COOKIE_NAME, user.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

// This function is kept for potential future use or for seeding the first admin user,
// but it is not exposed to the UI.
export async function signUp(name: string, email: string, password_input: string): Promise<void> {
    await dbConnect();
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

    if (role === 'admin') {
        await signIn(email, password_input);
    }
}

export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}
