# CMPRSSN Survey

A research survey capturing the human experience of AI-driven work compression.

**Live:** (Component of the CMPRSSN research project)
**Stack:** Next.js, TailwindCSS, Supabase, Recharts
**Status:** Maintained

## What This Is

CMPRSSN Survey is the survey component of the CMPRSSN research project. It collects structured responses about how workers experience AI-driven compression — role consolidation, skill devaluation, workload intensification, and autonomy erosion. Responses are scored algorithmically and stored in both Supabase and Airtable for research analysis.

The survey is designed to be completed in one sitting, with smooth question-by-question progression and clear progress indicators.

## Features

- 📋 **Structured Survey** — multi-question assessment with varied input types
- 📊 **Score Calculation** — algorithmic scoring of compression exposure
- 💾 **Dual Storage** — Supabase + Airtable for research flexibility
- ✨ **Animated Flow** — question-by-question progression
- 📱 **Responsive** — mobile-friendly design

## AI Integration

None — pure data collection and algorithmic scoring.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Database:** Supabase + Airtable
- **AI:** None
- **Hosting:** Vercel

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `RESULTS_PASSWORD` | Password for viewing aggregate results |

## Part of SpiritTree

This project is part of the [SpiritTree](https://spirittree.dev) ecosystem — an autonomous AI operation building tools for the agent economy and displaced workers.

## License

MIT
