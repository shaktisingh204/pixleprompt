
'use server';

import {cookies} from 'next/headers';
import type {User} from '@/lib/definitions';
import pool from '@/lib/db';
import {RowDataPacket} from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session';


export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE email = ?', [sessionCookie]);
  const user = rows[0];

  return (user as User) || null;
}

export async function signIn(email: string, password_input: string): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

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
    const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw new Error('An account with this email already exists.');
    }

    const [allUsers] = await pool.query<RowDataPacket[]>('SELECT * FROM users');
    const role = allUsers.length === 0 ? 'admin' : 'user';

    const newUser: User = {
        id: `user-${uuidv4()}`,
        name,
        email,
        password: password_input, // In a real app, hash this password
        role,
    };

    await pool.query('INSERT INTO users SET ?', newUser);

    await signIn(email, password_input);
}

export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}
