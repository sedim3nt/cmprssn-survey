export interface Question {
  id: string;
  section: string;
  text: string;
  type: 'single' | 'multi' | 'text';
  options?: string[];
  maxChars?: number;
  placeholder?: string;
}

export const QUESTIONS: Question[] = [
  // Section 1: Composition Anatomy
  {
    id: 'q1',
    section: 'Composition Anatomy',
    text: 'What best describes your agent setup?',
    type: 'single',
    options: [
      'I use AI tools (ChatGPT, Copilot) but don\'t run persistent agents',
      'I run 1-2 agents for specific tasks',
      'I run a multi-agent fleet with defined roles',
      'My entire operation is agent-native from day one',
      'I\'m building agent infrastructure for others',
    ],
  },
  {
    id: 'q2',
    section: 'Composition Anatomy',
    text: 'How do you and your agents divide labor?',
    type: 'single',
    options: [
      'I do the work, AI assists',
      'AI does the work, I review',
      'AI does the work, I direct strategy',
      'Agents run autonomously, I handle exceptions',
      'I\'m not sure where I end and agents begin',
    ],
  },
  {
    id: 'q3',
    section: 'Composition Anatomy',
    text: 'Where do you draw the autonomy boundary?',
    type: 'single',
    options: [
      'Agents need approval for everything',
      'Most things need approval, some are automated',
      'Roughly 50/50',
      'Most runs autonomously, I handle edge cases',
      'Almost everything runs without me',
    ],
  },
  // Section 2: Governance Without Hierarchy
  {
    id: 'q4',
    section: 'Governance Without Hierarchy',
    text: 'How do you govern what agents can do?',
    type: 'single',
    options: [
      'No explicit governance',
      'Mental rules I haven\'t written down',
      'Written docs/guidelines',
      'Config files (AGENTS.md, SOUL.md, etc.)',
      'Programmatic policy with enforcement and monitoring',
    ],
  },
  {
    id: 'q5',
    section: 'Governance Without Hierarchy',
    text: 'What\'s your audit trail?',
    type: 'single',
    options: [
      'None',
      'I check outputs manually',
      'Git history / logs',
      'Structured logging with review',
      'Real-time monitoring and alerts',
    ],
  },
  // Section 3: Failure & Recovery
  {
    id: 'q6',
    section: 'Failure & Recovery',
    text: 'What\'s the worst agent failure you\'ve experienced?',
    type: 'text',
    maxChars: 500,
    placeholder: 'Describe what happened, what broke, and what the blast radius was...',
  },
  {
    id: 'q7',
    section: 'Failure & Recovery',
    text: 'How do you handle agent failures?',
    type: 'single',
    options: [
      'Fix everything manually',
      'Retry and hope',
      'Fallback chains',
      'Self-healing with human escalation',
      'Agents diagnose and fix each other',
    ],
  },
  // Section 4: Economics
  {
    id: 'q8',
    section: 'Economics',
    text: 'What\'s your monthly AI compute spend?',
    type: 'single',
    options: [
      'Under $20',
      '$20–100',
      '$100–500',
      '$500–2000',
      'Over $2000',
    ],
  },
  {
    id: 'q9',
    section: 'Economics',
    text: 'How do you think about the unit of value in agent work?',
    type: 'single',
    options: [
      'Per token / API call',
      'Per task completed',
      'Per outcome achieved',
      'Per hour of equivalent human labor',
      'I haven\'t figured this out yet',
    ],
  },
  // Section 5: Scale & Composability
  {
    id: 'q10',
    section: 'Scale & Composability',
    text: 'What protocols/tools do your agents use to communicate?',
    type: 'multi',
    options: [
      'They don\'t communicate',
      'Shared filesystem',
      'MCP',
      'A2A',
      'Custom protocols',
      'Message queues',
      'Direct API calls',
    ],
  },
  {
    id: 'q11',
    section: 'Scale & Composability',
    text: 'What\'s your biggest unsolved problem with agents right now?',
    type: 'text',
    maxChars: 500,
    placeholder: 'What\'s the thing that keeps you up at night about your agent setup?',
  },
  // Section 6: Attribution
  {
    id: 'q12',
    section: 'Attribution',
    text: 'How would you like to be referenced in the research?',
    type: 'single',
    options: [
      'Anonymous',
      'Context only (role/setup description, no name)',
      'Named (approved before publication)',
    ],
  },
];

// Scoring: derive autonomy (0-4) and governance (0-4) from answers
export function scoreAnswers(answers: Record<string, string | string[]>): {
  autonomy: number;
  governance: number;
  quadrant: string;
  profile: string;
} {
  // Autonomy from Q2 + Q3 (0-4 each, averaged)
  const q2Score = ['I do the work, AI assists', 'AI does the work, I review', 'AI does the work, I direct strategy', 'Agents run autonomously, I handle exceptions', "I'm not sure where I end and agents begin"].indexOf(answers.q2 as string);
  const q3Score = ['Agents need approval for everything', 'Most things need approval, some are automated', 'Roughly 50/50', 'Most runs autonomously, I handle edge cases', 'Almost everything runs without me'].indexOf(answers.q3 as string);
  
  const autonomyRaw = Math.max(0, q2Score) + Math.max(0, q3Score);
  const autonomy = Math.min(4, Math.round(autonomyRaw / 2));

  // Governance from Q4 + Q5
  const q4Score = ['No explicit governance', "Mental rules I haven't written down", 'Written docs/guidelines', 'Config files (AGENTS.md, SOUL.md, etc.)', 'Programmatic policy with enforcement and monitoring'].indexOf(answers.q4 as string);
  const q5Score = ['None', 'I check outputs manually', 'Git history / logs', 'Structured logging with review', 'Real-time monitoring and alerts'].indexOf(answers.q5 as string);
  
  const governanceRaw = Math.max(0, q4Score) + Math.max(0, q5Score);
  const governance = Math.min(4, Math.round(governanceRaw / 2));

  // Quadrant: autonomy X-axis, governance Y-axis
  // High autonomy = right, High governance = top
  const highAuto = autonomy >= 2;
  const highGov = governance >= 2;

  let quadrant: string;
  let profile: string;

  if (!highAuto && !highGov) {
    quadrant = 'Manual Craft';
    profile = 'You\'re in the Manual Craft quadrant — high human involvement, minimal formal structure. You\'re doing the work yourself with AI as a tool, not an actor. Most operators start here.';
  } else if (!highAuto && highGov) {
    quadrant = 'Supervised Fleet';
    profile = 'You\'re in the Supervised Fleet quadrant — tight control with strong governance. You\'ve built the rails before running the trains. Deliberate and defensible.';
  } else if (highAuto && !highGov) {
    quadrant = 'Cowboy Ops';
    profile = 'You\'re in the Cowboy Ops quadrant — high autonomy, low governance. You\'re moving fast and breaking things. This works until it doesn\'t. The blast radius question is when, not if.';
  } else {
    quadrant = 'Composed System';
    profile = 'You\'re in the Composed System quadrant — high autonomy with strong governance. This is the endgame: agents that move fast within well-defined guardrails. You\'re building infrastructure, not just using tools.';
  }

  return { autonomy, governance, quadrant, profile };
}

export interface Reading {
  title: string;
  author: string;
  url: string;
  why: string;
}

export function getReadings(quadrant: string): Reading[] {
  const readings: Record<string, Reading[]> = {
    'Manual Craft': [
      {
        title: 'The Coming AI Agent Wave',
        author: 'Sequoia Capital',
        url: 'https://www.sequoiacap.com/article/ai-agents/',
        why: 'Framing for where agent ops is heading and why manual won\'t scale.',
      },
      {
        title: 'Building Effective Agents',
        author: 'Anthropic',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
        why: 'A practitioner guide to moving from tool use to agentic workflows.',
      },
      {
        title: 'The Future of Work Is Agent-Native',
        author: 'Harrison Chase',
        url: 'https://blog.langchain.dev/',
        why: 'Why delegation is the leverage point, not just assistance.',
      },
    ],
    'Supervised Fleet': [
      {
        title: 'AGENTS.md — Governing Your AI Stack',
        author: 'SpiritTree',
        url: 'https://spirittree.dev',
        why: 'Config-file governance as a pattern for scaling supervised operations.',
      },
      {
        title: 'AI Safety via Debate',
        author: 'OpenAI',
        url: 'https://openai.com/research/debate',
        why: 'How to think about oversight when agents outnumber reviewers.',
      },
      {
        title: 'Responsible Scaling Policy',
        author: 'Anthropic',
        url: 'https://www.anthropic.com/news/responsible-scaling-policy',
        why: 'Institutional thinking on governance that can inform individual operator policy.',
      },
    ],
    'Cowboy Ops': [
      {
        title: 'Why Your Agents Need a SOUL.md',
        author: 'SpiritTree',
        url: 'https://spirittree.dev',
        why: 'Structural governance that doesn\'t slow you down.',
      },
      {
        title: 'The Bitter Lesson of AI Safety',
        author: 'Rich Sutton',
        url: 'http://www.incompleteideas.net/IncIdeas/BitterLesson.html',
        why: 'Why governance has to scale with capability, not lag behind it.',
      },
      {
        title: 'Failure Modes in Agentic Systems',
        author: 'Anthropic',
        url: 'https://www.anthropic.com/research',
        why: 'Catalog of real failures — useful for designing your first guardrails.',
      },
    ],
    'Composed System': [
      {
        title: 'A2A Protocol',
        author: 'Google',
        url: 'https://google.github.io/A2A/',
        why: 'The emerging standard for agent-to-agent communication at scale.',
      },
      {
        title: 'MCP: Model Context Protocol',
        author: 'Anthropic',
        url: 'https://modelcontextprotocol.io',
        why: 'The tooling layer that makes composed systems composable.',
      },
      {
        title: 'Orchestrating AI Agents',
        author: 'LangGraph',
        url: 'https://blog.langchain.dev/langgraph/',
        why: 'Graph-based orchestration for complex multi-agent systems.',
      },
    ],
  };

  return readings[quadrant] || readings['Manual Craft'];
}
