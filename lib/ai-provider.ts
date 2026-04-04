import { createOpenAI } from '@ai-sdk/openai';

const provider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'https://survey.spirittree.dev',
    'X-Title': 'CMPRSSN Survey',
  },
});

export const defaultModel = provider('anthropic/claude-haiku-4-5');
export { provider };
