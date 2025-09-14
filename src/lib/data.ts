import type {Prompt, Category, User} from '@/lib/definitions';

// Mock user data. In a real application, this would come from a database.
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // In a real app, this should be a hash.
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  },
];

export const categories: Category[] = [
  {id: 'cat-1', name: 'Art', icon: 'Palette'},
  {id: 'cat-2', name: 'Writing', icon: 'FileText'},
  {id: 'cat-3', name: 'Code', icon: 'CodeXml'},
  {id: 'cat-4', name: 'Business', icon: 'Briefcase'},
];

export const prompts: Prompt[] = [
  {
    id: 'p-1',
    text: 'A futuristic cityscape at dusk, with flying vehicles and holographic ads, in the style of Blade Runner.',
    categoryId: 'cat-1',
    imageId: 'img_prompt_1',
    status: 'approved',
  },
  {
    id: 'p-2',
    text: 'Create a logo for a coffee shop named "The Daily Grind" featuring a stylized coffee bean and a rising sun.',
    categoryId: 'cat-1',
    imageId: 'img_prompt_2',
    status: 'approved',
  },
  {
    id: 'p-3',
    text: 'Write a short story about a time traveler who gets stuck in the past and has to adapt to a simpler life.',
    categoryId: 'cat-2',
    imageId: 'img_prompt_3',
    status: 'approved',
  },
  {
    id: 'p-4',
    text: 'Compose a blog post titled "5 Tips for More Productive Mornings" aimed at young professionals.',
    categoryId: 'cat-2',
    imageId: 'img_prompt_4',
    status: 'approved',
  },
  {
    id: 'p-5',
    text: 'Generate a Python script that scrapes a website for all image URLs and downloads them to a local folder.',
    categoryId: 'cat-3',
    imageId: 'img_prompt_5',
    status: 'approved',
  },
  {
    id: 'p-6',
    text: 'Write a React component for a customizable button with different variants (primary, secondary, destructive).',
    categoryId: 'cat-3',
    imageId: 'img_prompt_6',
    status: 'pending',
    submittedBy: 'user-2',
  },
  {
    id: 'p-7',
    text: 'Draft a business plan for a subscription box service that delivers artisanal snacks from around the world.',
    categoryId: 'cat-4',
    imageId: 'img_prompt_7',
    status: 'approved',
  },
  {
    id: 'p-8',
    text: 'Create a marketing email campaign to announce a new feature for a SaaS product, highlighting its benefits.',
    categoryId: 'cat-4',
    imageId: 'img_prompt_8',
    status: 'approved',
  },
  {
    id: 'p-9',
    text: 'An enchanted forest filled with glowing mushrooms and mythical creatures, painted in a watercolor style.',
    categoryId: 'cat-1',
    imageId: 'img_prompt_9',
    status: 'pending',
    submittedBy: 'user-2',
  },
  {
    id: 'p-10',
    text: 'Develop a five-tweet thread explaining the concept of blockchain to a non-technical audience.',
    categoryId: 'cat-2',
    imageId: 'img_prompt_10',
    status: 'approved',
  },
  {
    id: 'p-11',
    text: 'Explain the CSS box model using an analogy that a beginner can easily understand.',
    categoryId: 'cat-3',
    imageId: 'img_prompt_11',
    status: 'approved',
  },
  {
    id: 'p-12',
    text: 'Outline a pitch deck for a mobile app that helps users find and book local fitness classes.',
    categoryId: 'cat-4',
    imageId: 'img_prompt_12',
    status: 'approved',
  },
];