import {cookies} from 'next/headers';
import {users, type User} from '@/lib/data';
import {NextResponse} from 'next/server';

const SESSION_COOKIE_NAME = 'session';

// This is a simplified session management for demonstration purposes.
// In a production app, use a robust solution like NextAuth.js or a dedicated auth service.

export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  const user = users.find(u => u.email === sessionCookie);
  return user || null;
}

export async function signIn(email: string, password_input: string): Promise<void> {
  const user = users.find(u => u.email === email);

  if (!user || user.password !== password_input) {
    // In a real app, you'd use a more secure password comparison (e.g., bcrypt.compare)
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
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // This is for demonstration only. In a real app, you would hash the password
  // and save the new user to a database.
  const newUser: User = {
    id: `user-${users.length + 1}`,
    name,
    email,
    password: password_input,
    role: 'user', // Default role for new users
  };
  users.push(newUser);

  await signIn(email, password_input);
}

export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}
