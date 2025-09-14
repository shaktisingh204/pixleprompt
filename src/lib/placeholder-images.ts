import pool from '@/lib/db';
import {RowDataPacket} from 'mysql2';


export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export async function getPlaceholderImages(): Promise<ImagePlaceholder[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM placeholder_images');
    return rows as ImagePlaceholder[];
}
