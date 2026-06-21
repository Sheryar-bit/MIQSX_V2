# MIQSX — Build Plan & Status

> AI Brand Operating System. This file is the single source of truth for where we
> stand. Update the **Status** column and the **Changelog** after each phase.

**Last updated:** 2026-06-19
**Current phase:** Phase 3 (multi-tenancy). Mongo connected ✓. Stripe (Pro+Agency) built — needs dashboard keys/prices to go live.

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
| Multi-tenancy (Organization / `requireRole`) | 🔴 |
| Object storage (images out of data-URLs) | 🔴 |
| Async AI job queue | 🔴 |
| Observability / CSP / tests / CI | 🔴 |

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

## Phase 3 — Real multi-tenancy (unblock Agency) · 🟡 IN PROGRESS · ~2 weeks · BIGGEST GAP

| # | Item | Status |
|---|---|---|
| 1 | Introduce `Organization` model; brands/reviews/analytics keyed by `orgId` | ⚪ pending team decision on data model |
| 2 | `requireRole()` guard replacing hardcoded `{ userId }` (e.g. `api/brand/[id]`) | ⚪ depends on #1 |
| 3 | Finish invite flow — `/team/accept/[token]` page + accept route | ✅ done |
| 4 | Fix IDOR / mass-assignment — scope writes by tenant + whitelist bodies | 🟡 `brand/[id]` PATCH whitelisted; full sweep pending |

**Done now:** invite accept route (`/api/team/invite/[token]`) + page (`/team/accept/[token]`) using existing
`User.teamMembers` model; seat-limit re-checked at accept; self-accept/duplicate guards. Login + signup now
honor `?callbackUrl=`. `brand/[id]` PATCH no longer mass-assignable (field whitelist).
**Note:** accepting an invite adds the member, but they still won't *see* the owner's brands until #1 (brands
keyed by org/owner instead of `userId`) lands — that's the architectural decision your team is reviewing.
**Exit:** agency owner invites an editor who logs in and edits shared brands with correct permissions.

---

## Phase 4 — Scale · ⚪ ~1.5 weeks

| # | Item | Status |
|---|---|---|
| 1 | Object storage (R2/Cloudinary) — images out of DB/data-URLs | ⚪ |
| 2 | Async AI via queue (QStash/BullMQ) → `202 + jobId`, poll | ⚪ |
| 3 | Analytics rollup — TTL index + nightly rollup; fewer aggregations/load | ⚪ |
| 4 | Redis caching (plan/profile/dashboard) + DB resilience (`/api/health`) | ⚪ |

**Exit:** heavy generations don't time out; dashboard stays fast at scale.

---

## Phase 5 — Harden & observe · ⚪ ~1 week

Sentry + pino + PostHog · CSP via `middleware.ts` · lock `next.config` image hosts (no `**`) ·
email verification / password reset / OAuth · Vitest on **auth, limits, tenancy** + GitHub Actions + staging.

**Exit:** regressions caught in CI; prod errors page you.

---

## Phase 6 — Moat · ⚪ ongoing

Brand governance as headline (Guardian/Focus-Group/Stress-Test/Cultural-Check → compliance score on every asset) ·
agency white-label · PKR pricing + local rails · plan-gated model quality (free→FLUX schnell, pro→FLUX dev, agency→Recraft/Ideogram).

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

## Changelog
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
