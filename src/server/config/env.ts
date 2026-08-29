import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  GEMINI_API_KEY?: string;
  APP_URL: string;
  MONGO_URI: string;
  WHATSAPP_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
  GMAIL_CLIENT_ID: string;
  GMAIL_CLIENT_SECRET: string;
  INSTAGRAM_ACCESS_TOKEN: string;
  JWT_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

export function validateEnv(): { config: EnvConfig; warnings: string[]; errors: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'MY_GEMINI_API_KEY') {
    warnings.push('GEMINI_API_KEY is not configured. Jarvis will use intelligent heuristics and fallback AI logic.');
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/jarvis';
  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI not specified. Using high-performance embedded in-memory persistence layer.');
  }

  const jwtSecret = process.env.JWT_SECRET || 'jarvis_default_secure_secret_2026';
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET is using default development key.');
  }

  const config: EnvConfig = {
    PORT: 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    GEMINI_API_KEY: geminiKey,
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    MONGO_URI: mongoUri,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || 'EAABw_jarvis_demo_token',
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'jarvis_secure_verify_token',
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || 'jarvis-demo-client-id.apps.googleusercontent.com',
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || 'GOCSPX-jarvis-demo-secret',
    INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN || 'IGQVJ_jarvis_demo_token',
    JWT_SECRET: jwtSecret,
    RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
    RATE_LIMIT_MAX: 120, // 120 requests per minute
  };

  return { config, warnings, errors };
}

export const env = validateEnv().config;
