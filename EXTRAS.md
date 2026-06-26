# MIQSX — Extras & Backlog (not built)

> Features that are **NOT built yet**. This is the future-work list, separate from what's
> shipped (see [STATUS.md](./STATUS.md)) and the phased roadmap ([PLAN.md](./PLAN.md)).

**Last updated:** 2026-06-21

---

## ❗ Required for the Agency tier (not truly optional if you sell Agency)

- **Organization / Workspace model** — Make brands belong to a *company*, not one person, so a
  team can share them. Without it, invited teammates log in and see nothing. *Biggest unbuilt feature.*
- **Role-based permissions (`requireRole`)** — Admin / Editor / Viewer rules on every action. Needs the
  Organization model first.

> These two are the only substantial *unbuilt* features. Free + Pro tiers don't need them; Agency does.

---

## 🔌 Quick to add once you sign up for a service

- **Stripe go-live** — Payment code is done; just needs the 4 keys from your team to switch on. *(Closest to done.)*
- **Object storage (R2 / Cloudinary)** — Move generated images out of the database to a proper image host.
- **Async AI job queue (Upstash QStash)** — Run slow AI generations in the background so they don't time out.
- **Redis caching (Upstash)** — Cache plan/profile/dashboard lookups; also makes rate-limiting multi-server safe.
- **Observability (Sentry / pino / PostHog)** — Auto-alerts on errors + product usage analytics.
- **JazzCash / Easypaisa** — Pakistan-local payment methods alongside Stripe. Add after Stripe is validated.

---

## 🧩 Nice-to-have polish (no blocker, just not started)

- **OAuth + 2FA login** — "Sign in with Google" + optional two-factor codes.
- **Staging environment** — A private test copy of the site before changes hit real users.
- **Dashboard reads rollups** — Wire analytics to read the pre-built nightly summary (already created) so it
  stays fast at scale. *(Half-done: summary infra exists, screen not wired to it.)*
- **One-Click Rebrand** — Change Brand DNA → all template assets regenerate automatically.

---

## ⚠️ Built but fragile (work today, but manage the risk)

- **Instagram handle availability** — No free/legal API; will break unpredictably. Mark "best guess" or drop.
- **Brand Guardian score** — Color part is real maths; tone/style is an AI guess. Don't sell "0–100" as precise.
- **Festive/desi dates** — Eid/Ramadan are moon-sighting based (±1 day in PK); use a maintained Hijri source.
- **FLUX free tier** — Slow cold starts + rate limits. Fine for demos; paid inference for smooth production
  (plan-gating already routes paid users to better models).

---

## Priority order (suggested)
1. **Stripe go-live** → unlock Free/Pro revenue.
2. **Organization + permissions** → unlock the Agency tier.
3. **Object storage** → before real image volume.
4. The rest (queue, caching, observability, OAuth, JazzCash) → as you scale / as needed.
