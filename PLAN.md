# MIQSX — Build Plan & Status

> AI Brand Operating System. This file is the single source of truth for where we
> stand. Update the **Status** column and the **Changelog** after each phase.

**Last updated:** 2026-06-21
**Current phase:** Phase 3 multi-tenancy **BUILT** (Org/Membership, requireRole, plan→org, org-scoped data, switcher). Needs a one-time migration run + browser verification. Phase 4–5 remaining items blocked on accounts (R2/Upstash/Sentry).

---

## Legend
- ✅ Done & verified in code
- 🟡 Partial / in progress
- 🔴 Not started / broken
- ⚪ Not started

---

## Where we stand (snapshot)

The full feature surface is built and the plan-metering layer is real and wired into
all 11 AI routes. Phase 0 (security) is complete. The next real work is throttling
(rate limits) and payments.

| Layer | State |
|---|---|
| Auth (login/register, bcrypt, DB-backed) | ✅ |
| Plan limits + per-feature enforcement (`enforceLimit`) | ✅ |
| Usage tracking (`trackEvent` → `usageCounts`) | ✅ |
| Feature surface (logo/captions/taglines/imagery/festive/export/guardian/focus-group/stress-test/cultural/audit/brief/moodboard/names/review) | ✅ |
| Rate limiting (burst/cost-bomb protection) | ✅ |
| Real payments — Stripe (Pro+Agency) checkout + webhook + portal | ✅ code; needs keys |
| Real payments — JazzCash/Easypaisa (PK) | 🔴 deferred |
| MongoDB Atlas connected | ✅ |
| JWT carries `plan` + re-sync on upgrade | ✅ |
| Team invite **accept** flow (route + page) | ✅ |
| IDOR / mass-assignment fixes (brand + review routes) | ✅ |
| DB resilience (timeouts, pool, `/api/health`) | ✅ |
| Security headers + CSP + locked image hosts | ✅ |
| Email verification + password reset | ✅ |
| Analytics TTL + nightly rollup | ✅ |
| Plan-gated image model quality | ✅ |
| Tests (Vitest) + CI (GitHub Actions) | ✅ |
| Multi-tenancy (Organization / `requireRole`) | ✅ built — needs migration run + browser test |
| Object storage (images out of data-URLs) | 🔴 needs R2/Cloudinary |
| Async AI job queue | 🔴 needs QStash |
| Redis caching | 🔴 needs Upstash |
| Observability (Sentry/pino/PostHog), OAuth/2FA | 🔴 |

---

## ✅ Shipped & working (code complete, typecheck clean)

- **Auth** — DB-backed login/register with bcrypt; test login dev-only (backdoor closed).
- **Plan limits** — `enforceLimit()` returns 429 over quota on all 11 AI routes; monthly usage counters via `trackEvent`.
- **Rate limiting** — 15 req/60s per user/IP on AI endpoints (`middleware.ts`); Upstash-ready, in-memory fallback.
- **Usage UI** — `/analytics` "X of Y used" bars; `/billing` plan grid.
- **Stripe billing (Pro + Agency)** — Checkout, signature-verified webhook → single `activatePlan()` path, hosted
  customer portal. *Code done — needs dashboard keys/prices to go live (see "Stripe handoff" below).*
- **JWT plan** — `session.user.plan` everywhere; re-syncs on upgrade.
- **Team invites** — send + accept flow (`/team/accept/[token]`) with seat-limit/self-accept/duplicate guards.
- **MongoDB Atlas** — connected & verified (db `miqsx`).
- **IDOR fix** — `brand/[id]` PATCH whitelists fields (no ownership reassignment).
- **Feature surface** — logo, captions, taglines, imagery, festive, export, guardian, focus-group, stress-test,
  cultural, audit, brief, moodboard, names, review board + public approval.
- **Hardening** — DB resilience + `/api/health`; security headers/CSP + locked image hosts; email verification +
  password reset; analytics TTL + nightly rollup; plan-gated image model; IDOR fixes; Vitest + CI.

---

## Phase 0 — Stop the bleeding (security) · ✅ DONE

| # | Item | Status |
|---|---|---|
| 1 | Remove auth backdoor → DB + bcrypt; test user dev-only | ✅ `src/lib/auth.ts` |
| 2 | Gate `POST /api/billing` (no client-driven plan changes) | ✅ `src/app/api/billing/route.ts` (403 unless `ALLOW_DEV_PLAN_SWITCH`) |
| 3 | Email HTML-escape (`inviterName`/`role`) | ✅ `src/lib/email.ts` `escapeHtml()` |
| 4 | `.env` not tracked | ✅ not a git repo + `.gitignore` ignores `.env` |

**Manual (no code):** rotate `GROQ_API_KEY` + `NEXTAUTH_SECRET` *only if* `.env` was ever shared.
**Exit met:** registered users can log in; no hardcoded prod login; no free-plan escalation.

---

## Phase 1 — Make abuse expensive · ✅ DONE · ~2 days

| # | Item | Status |
|---|---|---|
| 1 | `enforceLimit()` on every `generate/*` + `validate/*` route → 429 over quota | ✅ wired in 11 routes |
| 2 | `trackEvent` increments usage counters | ✅ |
| 3 | **Rate limiting** — per-user + per-IP, on AI endpoints | ✅ `src/middleware.ts` + `src/lib/rate-limit.ts` |
| 4 | **Surface usage** — `/analytics` shows "X of Y used"; `/billing` shows plan grid | ✅ |

**Rate limit:** 15 req / 60s per user (per-IP if anon) on `/api/generate|validate|audit|brief|chat|names|moodboard`.
Uses Upstash REST when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set; in-memory fallback otherwise.
**Exit met:** a burst attacker hits a 429 wall before running up the Groq/fal bill.

---

## Phase 2 — Payments · 🟢 MOSTLY DONE · ~1 week

| # | Item | Status |
|---|---|---|
| 1 | Stripe (Pro + Agency) checkout | ✅ `api/billing/checkout` (subscription mode). JazzCash/Easypaisa deferred. |
| 2 | Webhook-driven plan state → `User.plan`/`planExpiresAt`; client never sets plan | ✅ `api/webhooks/stripe` (signature-verified) → `activatePlan()` |
| 3 | Put `plan` in JWT + re-sync on upgrade | ✅ jwt/session callbacks + `trigger:"update"` re-sync |
| 4 | Billing portal: invoices, cancel, proration | ✅ `api/billing/portal` (Stripe hosted portal) + button |

**Built:** `src/lib/stripe.ts`, checkout + webhook + portal routes, `stripeCustomerId`/`stripeSubscriptionId` on
User, billing page redirects to Stripe and re-syncs the session on return. Webhook handles
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
**Needs your action to go live:** create Stripe account → 2 products (Pro, Agency) → paste keys + price IDs into
`.env` → run `stripe listen` for local webhook secret. (See "Stripe setup steps" at bottom.)
**Deferred:** JazzCash/Easypaisa (PK rails) — separate integration, do after Stripe is validated.
**Exit:** pay → auto-upgrade → safe downgrade; gateway is the only source of truth. ✅ (once keys are set)

---

## Phase 3 — Real multi-tenancy (unblock Agency) · ✅ BUILT (needs migration + browser test) · ~2 weeks

Uniform-org model: **Organization = tenant** (holds plan/billing/usage), **Brand = client space**, solo user =
org of one. `Membership` join table with roles owner/admin/editor/viewer.

| # | Item | Status |
|---|---|---|
| 1 | `Organization` + `Membership` models; brands/reviews/analytics keyed by `orgId` | ✅ models + backfill migration (`/api/admin/migrate-orgs`) |
| 2 | `requireRole()` guard replacing hardcoded `{ userId }` everywhere | ✅ `src/lib/org-context.ts`; brand/review/team routes role-gated |
| 3 | Invite flow + accept into the org; org-switcher UI | ✅ accept writes `Membership`; `OrgSwitcher` + `/api/orgs` |
| 4 | IDOR / mass-assignment — org-scoped + whitelisted bodies | ✅ all brand/review writes |

**Built this pass (3A–3E):** Org/Membership models + `orgId` on Brand/Review/Analytics/TeamInvite; signup
creates a personal org; `activeOrgId` in the JWT with membership-checked switching; `requireRole`/`enforceOrgLimit`
guards; **plan + usage + Stripe moved from User → Organization** (checkout/webhook/portal/enforcement all org-based);
every brand/review/analytics/team query flipped to `orgId`; org-switcher (hidden for solo users) + member
management (role change / remove, owner-protected) + seat limits (viewers free).

**⚠️ Required before this works on existing data:** set `CRON_SECRET` in `.env`, then run once:
`curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/admin/migrate-orgs`
(creates a personal org + owner membership per existing user, backfills `orgId`). New signups don't need it.

**⚠️ Not yet browser-verified.** Typechecks + unit tests pass; the full agency flow (invite → accept → switch →
shared brands) needs a manual click-test.

**Dev caveat:** the dev-only test login (`test@miqsx.com`) has no Organization, so org-scoped routes 403 for it —
use a real registered account to test.

**Exit:** agency owner invites an editor who logs in, switches into the workspace, and edits shared brands with correct permissions.

---

## Phase 4 — Scale · 🟡 PARTIAL · ~1.5 weeks

| # | Item | Status |
|---|---|---|
| 1 | Object storage (R2/Cloudinary) — images out of DB/data-URLs | 🔴 needs account |
| 2 | Async AI via queue (QStash/BullMQ) → `202 + jobId`, poll | 🔴 needs QStash |
| 3 | Analytics rollup — TTL index + nightly rollup; fewer aggregations/load | ✅ TTL (90d) + `AnalyticsRollup` + `/api/cron/rollup` + `vercel.json` cron |
| 4 | DB resilience (`/api/health`, timeouts, pool) · Redis caching | 🟡 resilience ✅; Redis caching needs Upstash |

**Note:** rollup infra is built (model + nightly cron + TTL). Wiring the dashboard to *read* rollups instead of raw
aggregations is a follow-up (left as-is to avoid regressing the working analytics).
**Exit:** heavy generations don't time out; dashboard stays fast at scale.

---

## Phase 5 — Harden & observe · 🟡 PARTIAL · ~1 week

| # | Item | Status |
|---|---|---|
| 1 | Security headers + CSP + locked image hosts (`next.config.ts`) | ✅ |
| 2 | Email verification + password reset (no user-enumeration on reset) | ✅ |
| 3 | Tests (Vitest: plans, rate-limit, stripe) + GitHub Actions CI | ✅ 10 tests, typecheck + test in CI |
| 4 | Observability — Sentry + pino + PostHog | 🔴 needs accounts |
| 5 | OAuth + optional 2FA + staging env | 🔴 |

**Built:** CSP/security headers, `/auth/verify` + `/auth/forgot-password` + `/auth/reset-password` flows
(hashed single-use tokens, TTL auto-purge), verification email on register, `npm run typecheck`/`test`, CI workflow.
**Exit:** regressions caught in CI; prod errors page you.

---

## Phase 6 — Moat · 🟡 ongoing

Brand governance as headline (Guardian/Focus-Group/Stress-Test/Cultural-Check → compliance score on every asset) ·
agency white-label · PKR pricing + local rails ·
**plan-gated model quality ✅** (free→FLUX schnell, pro/agency→FLUX dev; `generate/imagery`).

---

## Known fragile features (built, but watch as you scale)
- 🔴 **Instagram availability** — no free/legal API; will silently break. Make best-effort or drop.
- 🟡 **Brand Guardian score** — color (ΔE) is real; tone/style are soft. Don't sell "0–100" as precision.
- 🟡 **FLUX imagery** — HF free tier = cold starts + rate limits; needs paid inference for production.
- 🟡 **Festive/desi dates** — Eid/Ramadan are lunar (PK moon-sighting ±1 day); verify against maintained Hijri source.
- 🟢 **Logo is vector-first** (`logo-composer.ts`) — correctly avoids AI-raster-logo trap; makes One-Click Rebrand realistic.

---

## Dependency order
`0 → 1 → 2` sequential (fix login → throttle → charge). **Phase 3 can run parallel to 2.**
Phases 4–5 after revenue. Phase 6 continuous.

---

## Stripe handoff — what to get back from whoever sets it up

The code is done. To switch it on, someone with Stripe dashboard access must create the account/products
and send back **4 values** + flip **1 setting**. Paste the 4 values into `.env`, restart, and billing is live.

**Send me back these 4 values:**
| `.env` key | What it is | Looks like |
|---|---|---|
| `STRIPE_SECRET_KEY` | Secret API key (Developers → API keys) | `sk_test_...` / `sk_live_...` |
| `STRIPE_PRICE_PRO` | Price ID of the **Pro** product (monthly recurring) | `price_...` |
| `STRIPE_PRICE_AGENCY` | Price ID of the **Agency** product (monthly recurring) | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook endpoint | `whsec_...` |

**Also have them do:** Settings → Billing → **Customer portal → Activate** (enables cancel/invoices button).

**Webhook endpoint they must register** (Developers → Webhooks → Add endpoint):
- URL: `https://<our-deployed-domain>/api/webhooks/stripe` (for local testing instead: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- The endpoint's signing secret = the `STRIPE_WEBHOOK_SECRET` above.

**Not needed:** publishable key (we redirect to Stripe-hosted Checkout, no client-side Stripe SDK).
Products: **MIQSX Pro** (PKR 2,999 / ~USD 11, monthly) and **MIQSX Agency** (PKR 7,999 / ~USD 29, monthly).

---

## Changelog
- **2026-06-21** — Phase 3 multi-tenancy BUILT (3A–3E). Added `Organization` + `Membership` models; `orgId` on
  Brand/Review/Analytics/TeamInvite; backfill migration (`/api/admin/migrate-orgs`). `src/lib/org-context.ts`
  (`getOrgContext`/`requireRole`/`enforceOrgLimit`); `activeOrgId` in JWT with membership-checked switching;
  signup creates a personal org. Moved plan + usage + Stripe (checkout/webhook/portal) from User → Organization.
  Flipped all brand/review/analytics/team queries to `orgId` with role gating. Org-switcher (`/api/orgs` +
  `OrgSwitcher`, hidden for solo) + member management (role/remove, owner-protected) + seat limits (viewers free).
  Typecheck clean, 10 tests green. Needs `CRON_SECRET` + one migration run + browser verification.
- **2026-06-19** — Hardening batch (all "buildable now" items). **Phase 4/5 partial:** DB resilience
  (`mongoose` timeouts/pool + `/api/health`); security headers + CSP + locked image hosts (`next.config.ts`);
  analytics TTL (90d) + `AnalyticsRollup` model + secured `/api/cron/rollup` + `vercel.json` cron; email
  verification + password reset (`AuthToken` model, hashed single-use tokens, `/auth/verify|forgot-password|
  reset-password` pages + routes, verification email on register, no user-enumeration); Vitest suite (10 tests:
  plans, rate-limit, stripe) + GitHub Actions CI. **Phase 3 #4:** IDOR/mass-assignment fixed across `review`
  routes (owner-scoped + whitelisted). **Phase 6:** plan-gated image model (free→schnell, pro/agency→dev).
  Typecheck clean, tests green. Remaining blocked on accounts (R2/QStash/Upstash/Sentry) or the Org decision.
- **2026-06-19** — Mongo + Stripe. Connected MongoDB Atlas (`MONGODB_URI`, db `miqsx`) — verified. Built Stripe
  for Pro + Agency: `src/lib/stripe.ts`, `api/billing/checkout` (subscription Checkout), `api/webhooks/stripe`
  (signature-verified → `activatePlan`), `api/billing/portal` (cancel/invoices). Added `stripeCustomerId`/
  `stripeSubscriptionId` to User; extended `activatePlan` for subscription period end. Billing page redirects
  to Stripe + re-syncs session on return. Needs dashboard keys/price IDs to go live. Typecheck clean.
- **2026-06-19** — Phase 3 groundwork. Completed invite-accept flow: `GET/POST /api/team/invite/[token]`
  + `/team/accept/[token]` page (no longer a 404). Added self-accept/duplicate/seat-limit guards. Login +
  signup honor `?callbackUrl=`. Fixed mass-assignment in `brand/[id]` PATCH via field whitelist. Full
  `Organization` re-architecture (#1/#2) deferred pending team decision on the Agency data model. Typecheck clean.
- **2026-06-19** — Phase 2 (code-only parts). JWT now carries `plan` with re-sync on client `update()`
  (`src/lib/auth.ts` + `src/types/next-auth.d.ts`). Added `src/lib/activate-plan.ts` as the single
  server-side plan-mutation path; billing POST routed through it. Gateway integration (#1, #4) and the
  webhook route (#2) remain — blocked on payment-provider accounts + Mongo. Typecheck clean.
- **2026-06-19** — Phase 1 complete. Added burst rate limiting via `src/middleware.ts` +
  `src/lib/rate-limit.ts` (15 req/60s per user/IP on AI endpoints; Upstash REST when configured,
  in-memory fallback otherwise). Confirmed usage UI (`/analytics` bars, `/billing` plan grid) already done.
  Typecheck clean. **For prod:** set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (free Upstash tier).
- **2026-06-19** — Phase 0 complete. Fixed auth backdoor (`src/lib/auth.ts`): real users now
  authenticate against MongoDB with bcrypt; hardcoded test login restricted to `NODE_ENV !== "production"`.
  Confirmed billing gate + email escaping already in place. Typecheck clean. Created this plan.
