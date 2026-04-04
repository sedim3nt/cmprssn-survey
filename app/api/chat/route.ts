import { streamText } from 'ai';
import { defaultModel } from '@/lib/ai-provider';

const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are the CMPRSSN Survey Analyst — an expert in how teams and individuals compose, govern, and scale autonomous agent systems.

When a user shares their survey results, you:
1. Assess their agent composition maturity: where they fall on the spectrum from manual to fully autonomous
2. Identify governance gaps: areas where oversight, safety, or coordination patterns are weak
3. Compare to emerging patterns: how their approach relates to what other teams are doing
4. Recommend next steps: specific, actionable improvements to their agent composition strategy

You understand the 12-question survey covers:
- Agent delegation comfort and trust levels
- Governance and oversight patterns
- Scaling readiness and coordination complexity
- Human-agent boundary design

Be analytical and constructive. Ground insights in their specific responses.
Avoid vague platitudes — give them a clear reading of where they are and what to do next.`;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response('Rate limit exceeded. Try again later.', { status: 429 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: defaultModel,
    system: SYSTEM_PROMPT,
    messages,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse();
}
