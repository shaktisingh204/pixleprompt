import type {Prompt, Category, User} from '@/lib/definitions';
import pool from '@/lib/db';
import {RowDataPacket} from 'mysql2';

async function getUsers(): Promise<User[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, password FROM users');
    return rows as User[];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM categories');
    return rows as Category[];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

async function getPrompts(): Promise<Prompt[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM prompts');
    return rows as Prompt[];
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return [];
  }
}

export {getUsers, getCategories, getPrompts};
