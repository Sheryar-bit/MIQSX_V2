# MIQSX — What's Built & Working

> Snapshot of what exists today, what's verified, and what separates "SaaS plumbing"
> from "MVP-launch requirements." Companion to [PLAN.md](./PLAN.md) (the roadmap).

**Last updated:** 2026-06-21

---

## ✅ Verified live (run in the browser, not just compiled)
- **MongoDB Atlas** — connected (db `miqsx`).
- **Auth end-to-end** — account creation + sign-in confirmed working by the user.

Everything else below is **code-complete + typechecks + unit-tested**, but should still be
click-tested in the browser before launch (see "MVP launch checklist").

---

## 🎨 Product features (the app)

| Feature | What it does |
|---|---|
| AI Brand Strategist | Conversational onboarding (Groq) → structured Brand DNA |
| Brand DNA Engine | Typed brand object (colors, tone, audience, rules) injected into generation |
| Brand Name Generator | AI names + domain (.com/.pk) + Instagram handle availability |
| Reverse Moodboard | Upload images → extract palette + style keywords |
| Logo Generator | Vector-first SVG composition (icon library + fonts) |
| Captions + Taglines | Trilingual — English / Urdu / Roman Urdu (Groq) |
| Post Imagery | FLUX via fal.ai, style-prefixed, **plan-gated quality** |
| Festive Variants | Eid / Ramadan / 14 Aug / New Year SVG overlays |
| Multi-format Export | One image → 7 social sizes, zipped (sharp) |
| Brand Guardian | Consistency score (color ΔE + tone/style) |
| Brand Audit | Reverse-engineer DNA from existing assets |
| AI Focus Group | Synthetic persona reactions (Groq) |
| Logo Stress Test | Favicon / B&W / colorblind / print checks |
| Cultural Check | Pakistan-context content review (Groq) |
| WhatsApp Brief Parser | Messy chat → structured brief |
| Review Board | Draft → Review → Approved workflow + comments |
| Client Approval Links | Tokenized, login-free public approval pages |
| Public Brand Profiles | Shareable `/brands/[slug]` pages |

---

## 🔧 Platform / SaaS features (the business layer)

| Feature | What it does | Status |
|---|---|---|
| Accounts & Auth | DB-backed login/register, bcrypt, dev-only test user | ✅ verified |
| Email verification + password reset | Hashed single-use tokens, full flows, no user-enumeration | ✅ built |
| Plans & Tiers | Free / Pro / Agency with per-feature limits | ✅ built |
| Usage Metering | `enforceLimit()` → 429 over quota on all 11 AI routes | ✅ built |
| Usage Dashboard | `/analytics` "X of Y used" bars | ✅ built |
| Rate Limiting | 15 req/60s per user/IP (burst / cost-bomb protection) | ✅ built |
| Stripe Billing | Checkout + webhook + customer portal (Pro & Agency) | ✅ code; needs keys |
| Plan in JWT | `session.user.plan` everywhere; re-syncs on upgrade | ✅ built |
| Team Invites | Send + accept flow with seat-limit guards | ✅ built |
| Security Hardening | CSP, security headers, IDOR fixes, locked image hosts | ✅ built |
| DB Resilience | Timeouts, pooling, `/api/health` | ✅ built |
| Analytics Rollup | 90-day TTL + nightly aggregation cron | ✅ built |
| Tests + CI | Vitest (10 tests) + GitHub Actions | ✅ built |

---

## 💡 What makes it a SaaS (vs. just a tool)

A tool generates assets. A **SaaS** charges recurring money and controls access. These are the
features that make MIQSX a business, not a demo:

1. **Accounts & auth** — each user has their own data. ✅
2. **Plans & tiers** — Free / Pro / Agency define what you get. ✅
3. **Metering & enforcement** — limits actually block at the cap (5 logos on Free, etc.). ✅
4. **Billing** — recurring payment that upgrades you automatically. ✅ *(code; needs Stripe keys)*
5. **Rate limiting** — protects your unit economics from abuse. ✅
6. **Usage visibility** — users see consumption; you see analytics. ✅
7. **Multi-tenancy / teams** — multiple users collaborate under one paid account. ✅ *(built — Org/Membership/roles, org-scoped data, switcher; needs migration run + browser test)*

→ **7 of 7 are built.** Multi-tenancy (the Agency tier) now exists end-to-end in code, pending verification.

---

## 🚀 MVP launch checklist

### To launch **Free + Pro** (single-user SaaS) — you are ~3 steps away
- [x] Auth, plans, metering, rate limiting, usage UI — **done & (auth) verified**
- [ ] **Click-test core flows in browser** — sign up → generate → hit a limit → see upgrade prompt
- [ ] **Stripe go-live** — paste the 4 keys/price IDs your team sends (code is done)
- [ ] **Test a real payment** — test card → plan flips to Pro via webhook

### To launch the **Agency tier** (multi-user) — BUILT, needs verification
- [x] **Organization / Workspace model** — brands/reviews/analytics keyed to `orgId`
- [x] **`requireRole()` guard** — owner/admin/editor/viewer enforced across routes
- [x] **Invite → accept → org-switch → shared brands** + member management + seat limits
- [ ] **Run the one-time migration** (`/api/admin/migrate-orgs` with `CRON_SECRET`)
- [ ] **Browser-test the full agency flow** (invite a 2nd account, accept, switch, edit shared brand)

### Nice-to-have, not launch-blocking
- Object storage (R2/Cloudinary), async job queue (QStash), Redis caching, observability (Sentry/PostHog),
  OAuth/2FA, JazzCash/Easypaisa.

---

## TL;DR

- **Product:** 100% built (all 19 features).
- **SaaS layer:** ~90% built — auth verified live; billing just needs keys.
- **Free + Pro MVP:** launchable after a browser click-test + Stripe keys.
- **Agency MVP:** needs the multi-tenancy build (the one substantial feature left).
- **Everything else left** is scale/infra plumbing — quick to add when accounts exist, not launch-blocking.
