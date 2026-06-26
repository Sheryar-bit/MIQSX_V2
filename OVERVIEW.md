# MIQSX — Project Overview (for the team)

> One-page status of MIQSX, the AI Brand Operating System. Where we are, what's done,
> what's left, and what it takes to launch.

**Last updated:** 2026-06-21

---

## 🧭 TL;DR

- **Product features: 100% built** (all 19 — onboarding, logo, captions, imagery, guardian, review board, etc.).
- **SaaS layer: ~90% built** — accounts, plans, usage limits, rate limiting, billing code, team invites, security.
- **Verified live:** MongoDB connected; **sign-up + login confirmed working in the browser.**
- **Free + Pro tiers** are launch-ready after a browser click-test + switching on Stripe.
- **Agency tier** needs one more real build (multi-tenancy).
- Everything else remaining is "sign up for a service and flip it on," or nice-to-have polish.

---

## ✅ What's built & working

### Product (the app)
AI Brand Strategist (onboarding) · Brand DNA Engine · Name Generator · Reverse Moodboard ·
Vector Logo Generator · Trilingual Captions & Taglines (English/Urdu/Roman Urdu) · Post Imagery (FLUX) ·
Festive Variants (Eid/Ramadan/14 Aug) · Multi-format Export · Brand Guardian · Brand Audit ·
AI Focus Group · Logo Stress Test · Cultural Check · WhatsApp Brief Parser · Review Board ·
Client Approval Links · Public Brand Profiles.

### Platform / SaaS
| Feature | Status |
|---|---|
| Accounts & auth (login/register, bcrypt) | ✅ **verified live** |
| Email verification + password reset | ✅ built |
| Plans & tiers (Free / Pro / Agency) | ✅ built |
| Usage metering (limits → 429 over quota) | ✅ built |
| Usage dashboard ("X of Y used") | ✅ built |
| Rate limiting (abuse / cost protection) | ✅ built |
| Stripe billing (checkout + webhook + portal) | ✅ code — needs keys |
| Team invites (send + accept) | ✅ built |
| Security hardening (CSP, headers, IDOR fixes) | ✅ built |
| DB resilience + health check | ✅ built |
| Analytics rollup (TTL + nightly cron) | ✅ built |
| Tests + CI | ✅ built |

> "Built" = code-complete, typechecks, unit-tested. Only auth + DB are browser-verified so far.

---

## 💡 What makes it a SaaS (6 of 7 done)

A tool generates assets; a **SaaS** charges recurring money and controls access:
1. Accounts & auth ✅ 2. Plans & tiers ✅ 3. Limits that actually enforce ✅
4. Billing ✅ *(needs Stripe keys)* 5. Rate limiting ✅ 6. Usage visibility ✅
7. **Multi-tenancy / teams 🟡** — invites done, shared-data not yet.

---

## 🚀 What's needed to launch

### Free + Pro (single-user) — ~3 steps away
1. **Click-test the core flow** in browser (sign up → generate → hit a limit → upgrade prompt).
2. **Stripe go-live** — paste the 4 keys/price IDs (code is done; see below).
3. **Test one real payment** (test card → plan flips to Pro automatically).

### Agency tier — one more real build
- **Organization / Workspace model** — brands shared across a team, not locked to one person.
- **Role permissions** (Admin / Editor / Viewer).
- *(Invites already work — these two complete it.)*

---

## 📋 What's left (backlog)

### ❗ Required for Agency tier (not optional if we sell Agency)
- **Organization model** + **role-based permissions** — *the only substantial unbuilt feature.*

### 🔌 Quick to add once we sign up for a service
- **Stripe go-live** — needs 4 keys (closest to done).
- **Object storage** (Cloudflare R2 / Cloudinary) — move images out of the DB.
- **Async job queue** (Upstash QStash) — stop slow AI calls timing out.
- **Redis caching** (Upstash) — faster, and makes rate-limiting multi-server safe.
- **Observability** (Sentry / PostHog) — error alerts + usage analytics.
- **JazzCash / Easypaisa** — PK-local payments (after Stripe is validated).

### 🧩 Nice-to-have polish
- OAuth + 2FA login · Staging environment · Dashboard reads the nightly summary · One-Click Rebrand.

### ⚠️ Built but fragile (manage the risk)
- **Instagram availability** — no free/legal API, will break; mark "best guess" or drop.
- **Brand Guardian score** — color is real maths, tone/style is an AI guess; don't sell "0–100" as precise.
- **Festive dates** — Eid/Ramadan shift ±1 day on moon sighting; use a maintained Hijri source.
- **FLUX free tier** — slow cold starts; paid inference for smooth production (plan-gating already set up).

---

## 💳 Stripe setup — what we need from whoever has the dashboard

Code is done. To switch billing on, create the account/products and send back **4 values** + flip **1 setting**:

| Value | Where | Looks like |
|---|---|---|
| `STRIPE_SECRET_KEY` | Developers → API keys | `sk_test_...` |
| `STRIPE_PRICE_PRO` | Pro product → its price | `price_...` |
| `STRIPE_PRICE_AGENCY` | Agency product → its price | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | The webhook endpoint we register | `whsec_...` |

Also: **Settings → Billing → Customer Portal → Activate.**
Products: **MIQSX Pro** (~USD 11 / PKR 2,999, monthly) and **MIQSX Agency** (~USD 29 / PKR 7,999, monthly).
Webhook URL: `https://<our-domain>/api/webhooks/stripe` — events: `checkout.session.completed`,
`customer.subscription.updated`, `customer.subscription.deleted`.

---

## 🎯 Suggested priority order
1. Browser click-test the core flows.
2. Stripe go-live → start earning on Free/Pro.
3. Organization + permissions → unlock Agency.
4. Object storage → before real image volume.
5. The rest (queue, caching, observability, OAuth, JazzCash) → as we scale.
