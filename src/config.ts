import { config } from 'dotenv';
config();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const MONGO_URI = process.env.MONGO_URI;
