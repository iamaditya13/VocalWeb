# VocalWeb.ai

> Create your business website by speaking. No design skills required.

VocalWeb.ai is a production SaaS that lets small businesses generate a complete website from a voice recording — no design skills, no code, no agency needed. Speak for 60 seconds, get a live website.

## Architecture

```
vocalweb/
├── frontend/        # Next.js 14 App Router
└── backend/         # Express + PostgreSQL + BullMQ
```

## How It Works

1. User speaks a business description (recorded in-browser)
2. Audio is transcribed and sent to the AI generation pipeline
3. Google Gemini Flash generates a full HTML+CSS website (single file, no frameworks)
4. Groq (Llama 3.3 70B) acts as fallback if Gemini is unavailable
5. Emergency static template ensures generation never fails
6. Site is published instantly at `/sites/:slug`
7. Website can be pushed to GitHub or deployed to Vercel directly from the dashboard

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Clone

```bash
git clone https://github.com/iamaditya13/VocalWeb.git
cd VocalWeb
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with the variables listed below
npm run dev
# Runs on http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your env vars

# Setup database
npm run db:generate
npm run db:migrate

npm run dev
# Runs on http://localhost:4000
```

## Environment Variables

> `.env` files are gitignored. Use [backend/.env.example](backend/.env.example) as a template. Never commit real secrets.

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:4000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (auth verification) |
| `GEMINI_API_KEY` | Google Gemini API key (primary AI, free tier) |
| `GROQ_API_KEY` | Groq API key (fallback AI, free tier) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `PUBLISHED_BASE_URL` | Base URL for published sites |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `LOG_LEVEL` | Logger level (default `info`) |

## AI Provider Architecture

The generation pipeline uses a dual-provider system with automatic fallback:

| Priority | Provider | Model | Notes |
|---|---|---|---|
| 1 | Google Gemini Flash | `gemini-2.0-flash` | Primary — fast, free tier |
| 2 | Groq | `llama-3.3-70b-versatile` | Fallback — free tier |
| 3 | Static template | — | Emergency — never fails |

Provider stats available at `GET /api/admin/provider-stats`.

## Features

- **Voice-to-website** — record 60 seconds of speech, get a full HTML+CSS site
- **Live preview** — desktop and mobile viewport toggle
- **Publish** — host on VocalWeb at `/sites/:slug`
- **Download** — export as a single `.html` file
- **Push to GitHub** — create a repo and push `index.html` directly from the dashboard
- **Deploy to Vercel** — one-click Vercel deployment from the dashboard
- **Regenerate** — re-run AI generation any time
- **Skeleton UI** — Boneyard layout skeletons for all loading states

## Pricing Plans

| Plan | Price | Features |
|---|---|---|
| Free | ₹0 | 1 site |
| Pro | ₹999/mo | Unlimited sites, custom domain |
| Business | ₹2999/mo | Everything + priority support |

Payments handled via Razorpay (INR).

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy
```

### Backend → Railway
1. Push to GitHub
2. Connect repo in Railway
3. Add environment variables
4. Deploy

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Auth | Clerk |
| Backend | Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis |
| AI (Primary) | Google Gemini Flash (`@google/generative-ai`) |
| AI (Fallback) | Groq Llama 3.3 70B (`groq-sdk`) |
| Payments | Razorpay |
| Skeleton UI | Boneyard |
| Hosting | Vercel (frontend) + Railway (backend) |
