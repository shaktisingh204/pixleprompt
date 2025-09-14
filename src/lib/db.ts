

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function createTables() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(255) NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id VARCHAR(255) PRIMARY KEY,
        text TEXT NOT NULL,
        categoryId VARCHAR(255) NOT NULL,
        imageId VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
        submittedBy VARCHAR(255),
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (submittedBy) REFERENCES users(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS placeholder_images (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        imageHint VARCHAR(255) NOT NULL
      );
    `);
    
    // Seed initial data if tables are empty
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (Array.isArray(users) && users[0] && 'count' in users[0] && (users[0] as { count: number }).count === 0) {
        await connection.query(`
            INSERT INTO users (id, name, email, password, role) VALUES
            ('user-1', 'Admin User', 'admin@example.com', 'password123', 'admin'),
            ('user-2', 'Regular User', 'user@example.com', 'password123', 'user');
        `);
    }

    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
     if (Array.isArray(categories) && categories[0] && 'count' in categories[0] && (categories[0] as { count: number }).count === 0) {
        await connection.query(`
            INSERT INTO categories (id, name, icon) VALUES
            ('cat-1', 'Art', 'Palette'),
            ('cat-2', 'Writing', 'PenTool'),
            ('cat-3', 'Photography', 'Camera'),
            ('cat-4', 'Music', 'Music'),
            ('cat-5', 'Development', 'Code');
        `);
    }

    const [images] = await connection.query('SELECT COUNT(*) as count FROM placeholder_images');
    if (Array.isArray(images) && images[0] && 'count' in images[0] && (images[0] as { count: number }).count === 0) {
        await connection.query(`
            INSERT INTO placeholder_images (id, description, imageUrl, imageHint) VALUES
            ('img_prompt_1', 'A futuristic cityscape', 'https://picsum.photos/seed/prompt1/600/400', 'futuristic cityscape'),
            ('img_prompt_2', 'A serene forest path', 'https://picsum.photos/seed/prompt2/600/400', 'forest path'),
            ('img_prompt_3', 'A cup of coffee', 'https://picsum.photos/seed/prompt3/600/400', 'coffee cup'),
            ('img_prompt_4', 'An astronaut in space', 'https://picsum.photos/seed/prompt4/600/400', 'astronaut space'),
            ('img_prompt_5', 'A vintage record player', 'https://picsum.photos/seed/prompt5/600/400', 'record player'),
            ('img_prompt_6', 'A classic muscle car', 'https://picsum.photos/seed/prompt6/600/400', 'muscle car');
        `);
    }
    
    const [prompts] = await connection.query('SELECT COUNT(*) as count FROM prompts');
    if (Array.isArray(prompts) && prompts[0] && 'count' in prompts[0] && (prompts[0] as { count: number }).count === 0) {
        await connection.query(`
            INSERT INTO prompts (id, text, categoryId, imageId, status, submittedBy) VALUES
            ('p-1', 'A futuristic cityscape at dusk, with flying vehicles and holographic ads, in the style of Blade Runner.', 'cat-1', 'img_prompt_1', 'approved', 'user-1'),
            ('p-2', 'Compose a blog post titled "5 Tips for More Productive Mornings" aimed at young professionals.', 'cat-2', 'img_prompt_2', 'approved', 'user-2'),
            ('p-3', 'A close-up shot of a vintage camera on a wooden table, with soft, warm lighting.', 'cat-3', 'img_prompt_3', 'approved', 'user-1'),
            ('p-4', 'Create a lo-fi hip hop track with a melancholic melody and a steady, relaxing beat.', 'cat-4', 'img_prompt_4', 'approved', 'user-2'),
            ('p-5', 'Generate a Python script that automates daily file backups to a cloud storage service.', 'cat-5', 'img_prompt_5', 'approved', 'user-1'),
            ('p-6', 'Design a minimalist logo for a new tech startup called "Innovate".', 'cat-1', 'img_prompt_6', 'approved', 'user-2');
        `);
    }


  } finally {
    connection.release();
  }
}


// Initialize tables on startup
createTables().catch(console.error);

export default pool;
