import * as dotenv from 'dotenv';

dotenv.config();

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3004,
  environment: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.FRONTEND_URL || 'http://localhost:3000',

  // NLP api keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,

  // cache config
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 3600,

  // rate limiting
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,

  // metrics
  metricsEnabled: process.env.METRICS_ENABLED === 'true',
});
