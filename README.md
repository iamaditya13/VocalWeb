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

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in your env vars
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

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key (primary AI, free tier) |
| `GROQ_API_KEY` | Groq API key (fallback AI, free tier) |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |

## AI Provider Architecture

The generation pipeline uses a dual-provider system with automatic fallback:

| Priority | Provider | Model | Notes |
|---|---|---|---|
| 1 | Google Gemini Flash | `gemini-2.0-flash` | Primary — fast, free tier |
| 2 | Groq | `llama-3.3-70b-versatile` | Fallback — free tier |
| 3 | Static template | — | Emergency — never fails |

Provider stats available at `GET /api/admin/provider-stats`.

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
| Auth | NextAuth.js (credentials + Google OAuth) |
| Backend | Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis |
| AI (Primary) | Google Gemini Flash (`@google/generative-ai`) |
| AI (Fallback) | Groq Llama 3.3 70B (`groq-sdk`) |
| Payments | Razorpay |
| Hosting | Vercel (frontend) + Railway (backend) |
