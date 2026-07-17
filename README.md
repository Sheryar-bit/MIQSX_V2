# MIQSX

MIQSX is an AI Brand Operating System built with Next.js and TypeScript. It combines brand strategy, generation, review, billing, usage controls, and team collaboration into one SaaS platform for building and managing brand assets.

The repository contains two major parts:

- The main web app in the project root, built with Next.js 15 and React 19.
- A standalone Python model server in [model-server](model-server), used for custom image generation.

## What this project does

MIQSX is designed to help users create and govern brand systems rather than just generate isolated assets. The product includes a conversational brand strategist, naming, logos, captions, imagery, approval workflows, and public brand profiles. The platform layer adds accounts, plans, quotas, billing, rate limits, analytics, and team collaboration.

In practical terms, the app supports:

- Brand onboarding and structured brand DNA capture.
- Name generation with domain and handle checks.
- Moodboard analysis from uploaded images.
- Vector-first logo composition.
- Trilingual captions and taglines in English, Urdu, and Roman Urdu.
- AI post imagery generation with plan-gated quality.
- Festive variants for Eid, Ramadan, 14 August, and New Year.
- Social export in multiple sizes.
- Brand Guardian, Brand Audit, AI Focus Group, Logo Stress Test, and Cultural Check workflows.
- WhatsApp brief parsing.
- Review Board approval flows and public brand profile pages.

## Repository structure

Top-level layout:

- [src/app](src/app) - Next.js App Router routes, pages, layouts, API handlers, and route-local CSS.
- [src/components](src/components) - Shared application components such as sidebar, org switcher, invite notifications, and trial banner.
- [src/lib](src/lib) - Core business logic for auth, billing, plans, rate limiting, usage, email, images, MongoDB, and external service integrations.
- [src/models](src/models) - MongoDB / Mongoose data models.
- [src/types](src/types) - TypeScript ambient types and NextAuth typing.
- [model-server](model-server) - Independent FastAPI inference server for the custom Stable Diffusion + LoRA pipeline.
- [scripts](scripts) - Utility scripts used by the project.

## Feature overview

### Product surface

The app ships with the following brand-generation and review features:

- AI Brand Strategist onboarding.
- Brand DNA Engine with structured brand data.
- Brand Name Generator with availability checks.
- Reverse Moodboard from uploaded inspiration images.
- Vector-first logo generation.
- Captions and taglines in English, Urdu, and Roman Urdu.
- Post imagery generation through Cloudflare Workers AI and the custom model server path.
- Festive variants for seasonal and regional campaigns.
- Multi-format export for social publishing.
- Brand Guardian scoring.
- Brand Audit and reverse-brand extraction.
- AI Focus Group reactions.
- Logo Stress Test checks for favicon, monochrome, colorblind, and print contexts.
- Cultural Check for Pakistan-focused review.
- WhatsApp brief parsing into structured output.
- Review Board draft / review / approved workflow.
- Client approval links.
- Public brand profiles.

### Platform and SaaS layer

The business layer includes:

- DB-backed authentication and registration.
- Email verification.
- Password reset.
- Free, Pro, and Agency plan tiers.
- Usage metering and enforcement.
- Per-user / per-IP rate limiting on expensive routes.
- Stripe checkout, webhook-driven subscription updates, and customer portal.
- Team invites and invite acceptance.
- Organization-aware access control and role checks.
- Analytics tracking and nightly rollups.
- Security headers, CSP, and image host restrictions.
- Health checks and DB resilience handling.

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- MongoDB / Mongoose
- NextAuth
- Stripe
- Groq SDK
- Cloudflare Workers AI integration
- Upstash-compatible rate limiting
- Vitest
- Python FastAPI for the standalone model server

## Getting started

### Prerequisites

You will need:

- Node.js 20 or newer.
- A package manager such as npm.
- MongoDB access.
- A Groq API key.
- Stripe credentials if you want billing enabled.
- Optional service accounts for email, Cloudflare, Upstash, and the standalone model server.

### Install dependencies

```bash
npm install
```

### Run the web app

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run start
```

### Checks and tests

```bash
npm run lint
npm run typecheck
npm run test
npm run test:watch
```

## Environment variables

The project reads the following environment variables. Not all of them are required for local development, but they are referenced in the codebase.

### Core application

- `MONGODB_URI` - MongoDB connection string.
- `NEXTAUTH_SECRET` - NextAuth signing secret.
- `NEXTAUTH_URL` - Canonical app URL used by auth and email links.
- `APP_URL` - App URL used by billing routes when present.
- `GROQ_API_KEY` - Required for Groq-powered text generation.

### Billing and Stripe

- `STRIPE_SECRET_KEY` - Stripe secret API key.
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret.
- `STRIPE_PRICE_PRO_MONTHLY` - Pro monthly price ID.
- `STRIPE_PRICE_PRO_YEARLY` - Pro yearly price ID.
- `STRIPE_PRICE_AGENCY_MONTHLY` - Agency monthly price ID.
- `STRIPE_PRICE_AGENCY_YEARLY` - Agency yearly price ID.
- `ALLOW_DEV_PLAN_SWITCH` - Development-only toggle that allows direct plan switching through the billing route.

### Rate limiting and analytics

- `UPSTASH_REDIS_REST_URL` - Optional Upstash REST endpoint.
- `UPSTASH_REDIS_REST_TOKEN` - Optional Upstash token.
- `CRON_SECRET` - Protects cron and migration endpoints.
- `DISABLE_USAGE_LIMITS` - Development-only usage limit override.

### Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `ETHEREAL_USER`
- `ETHEREAL_PASS`

If SMTP is not configured, the app uses a development email fallback path.

### Cloudflare / image generation

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

### Standalone model server bridge

- `MODEL_SERVER_URL` - Base URL for the custom model server.
- `MODEL_SERVER_API_KEY` - Optional API key forwarded to the model server.

### Optional production and ops values

- `STRIPE_*` values for live billing.
- `UPSTASH_*` values for multi-instance rate limiting.
- `CRON_SECRET` for cron and migration routes.

## Feature routes and API surface

The application exposes a substantial API surface under [src/app/api](src/app/api).

Notable route groups include:

- `auth` - Login, registration, verification, password reset, and session handling.
- `billing` - Checkout, portal, and plan state routes.
- `webhooks` - Stripe webhook processing.
- `cron` - Scheduled rollups.
- `admin` - Migration utilities for existing data.
- `generate` - Asset generation endpoints.
- `validate` - Plan and limit-aware validation endpoints.
- `analytics` - Usage and summary endpoints.
- `team` and `orgs` - Team invite and organization management.
- `review`, `audit`, `brand`, `brief`, `moodboard`, `names`, `chat`, `validate` - Product-specific flows.

## Billing flow

Billing is driven by Stripe and is org-aware.

- The checkout route creates a Stripe subscription checkout session.
- The webhook route is the source of truth for plan changes.
- The customer portal route opens Stripe-hosted billing management.
- Plan changes are applied server-side through a single activation path.

To enable billing in a real environment, you need the Stripe secret key, price IDs, webhook secret, and a live webhook endpoint configured to call the app.

## Multi-tenancy and team access

The codebase includes organization-aware tenancy with membership roles.

- `Organization` acts as the tenant boundary.
- `Membership` links users to organizations.
- Brand, review, analytics, and team data are scoped by organization.
- Role checks enforce owner, admin, editor, and viewer access.
- Invite acceptance and organization switching are supported.

The docs indicate this layer is built in code but still needs a one-time migration for pre-existing data and a browser verification pass.

## Analytics and cron

The app supports analytics tracking and nightly rollups.

- Usage events are tracked into the analytics layer.
- A cron route aggregates older data into rollups.
- A TTL cleanup strategy is used to keep raw analytics bounded over time.
- `vercel.json` schedules the rollup job in production.

## Standalone model server

The [model-server](model-server) folder contains a separate FastAPI service for custom image generation.

It serves a Stable Diffusion 1.5 + LoRA pipeline and is independent from the Cloudflare Workers AI path. The Next.js app calls it when the user selects the model-based imagery flow.

### Model server setup

```bash
cd model-server
py -3.13 -m venv .venv
.venv\Scripts\activate
pip install torch --index-url https://download.pytorch.org/whl/cu126
pip install -r requirements.txt
```

If the LoRA repository is private, authenticate with Hugging Face first.

### Model server run command

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Model server endpoints

- `GET /health`
- `POST /generate`

### Model server environment overrides

- `BASE_MODEL`
- `LORA_WEIGHTS`
- `TORCH_DTYPE`
- `ENABLE_SAFETY_CHECKER`

The model server defaults to fp32 because some older NVIDIA cards can produce black images with fp16 diffusion.

## Deployment notes

- The web app is configured for Vercel-style deployment.
- The cron rollup endpoint is expected to run on a schedule.
- Stripe webhooks must be reachable from the deployed app URL.
- The custom model server can run locally, on a GPU box, or behind a tunnel if you want the Next.js app to point to it with `MODEL_SERVER_URL`.

## Useful scripts

- `npm run dev` - Start the app in development mode.
- `npm run build` - Create a production build.
- `npm run start` - Start the production server.
- `npm run lint` - Run Next.js linting.
- `npm run typecheck` - Run the TypeScript compiler in no-emit mode.
- `npm run test` - Run Vitest once.
- `npm run test:watch` - Run Vitest in watch mode.
- `scripts/set-plan.cjs` - Helper script for setting a workspace plan manually.

## Launch checklist

Before treating the app as launch-ready, the project docs recommend:

1. Click-testing the core flow in the browser: sign up, generate, hit a limit, and confirm the upgrade prompt.
2. Turning on Stripe with the correct keys, price IDs, and webhook secret.
3. Testing one real payment so the plan changes automatically.
4. For Agency workflows, running the organization migration and verifying invite, accept, switch, and shared editing flows.
5. Confirming the model server and image-generation path if you want to use the custom diffusion service.

## Known caveats

- Instagram handle availability is best-effort because there is no free/legal official API path.
- Brand Guardian score precision should be treated as directional rather than exact.
- Eid and Ramadan dates can drift by a day depending on moon sighting and the source used.
- The free FLUX path can be slow on cold starts.
- In-memory rate limiting is acceptable for development, but not for multi-instance production.

## Reference docs

The repository already includes deeper planning and status docs:

- [OVERVIEW.md](OVERVIEW.md)
- [PLAN.md](PLAN.md)
- [STATUS.md](STATUS.md)
- [EXTRAS.md](EXTRAS.md)
- [model-server/README.md](model-server/README.md)

These documents contain the most detailed product, roadmap, and launch-status notes for the project.
