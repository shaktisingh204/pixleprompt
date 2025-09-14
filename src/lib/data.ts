import type {Prompt, Category, User} from '@/lib/definitions';
import pool from '@/lib/db';
import {RowDataPacket} from 'mysql2';

async function getUsers(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, password FROM users');
    return rows as User[];
}

async function getCategories(): Promise<Category[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM categories');
    return rows as Category[];
}

async function getPrompts(): Promise<Prompt[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM prompts');
    return rows as Prompt[];
}


export {getUsers, getCategories, getPrompts};
