import { config } from 'dotenv';
config();

export const ENV = process.env.ENV;
export const NUMBER_TEST = process.env.NUMBER_TEST;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 3001;
