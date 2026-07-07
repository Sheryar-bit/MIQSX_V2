'use client';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import SharedNav from '../components/SharedNav';
import MarketingFooter from '../components/MarketingFooter';
import './pricing.css';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    blurb: 'For solo founders exploring their brand DNA.',
    cta: 'Get started free',
    href: '/auth/signup',
    highlight: false,
    features: [
      '1 Brand DNA',
      '30 generated assets / month',
      'Brand Guardian scoring',
      'Name generator',
      'Basic moodboard',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 19 },
    blurb: 'For freelancers and growing brands.',
    cta: 'Start Pro free',
    href: '/auth/signup?plan=pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      '5 Brand DNAs',
      'Unlimited asset generation',
      'Trilingual copy (EN · UR · Roman)',
      'Logo composer + export',
      'Cultural Check + Stress Test',
      'Focus group simulation',
      'Up to 3 seats',
      'Priority support',
    ],
  },
  {
    name: 'Agency',
    price: { monthly: 79, yearly: 55 },
    blurb: 'For studios managing multiple clients.',
    cta: 'Start Agency free',
    href: '/auth/signup?plan=agency',
    highlight: false,
    features: [
      'Unlimited Brand DNAs',
      'Unlimited asset generation',
      'All Pro features',
      'Client review links',
      'Audit log + activity feed',
      'Unlimited seats',
      'WhatsApp approval workflow',
      'Dedicated support',
    ],
  },
];

const CHECK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export default function PricingPage() {
  const [dark, setDark] = useTheme();
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ minHeight: '100vh' }}>
      <SharedNav dark={dark} setDark={setDark} />

      <main className="pr-main">
        {/* Header */}
        <div className="pr-header">
          <div className="pr-eyebrow">Pricing</div>
          <h1 className="pr-title">
            Simple,{' '}
            <span className="pr-italic">honest</span>{' '}
            pricing.
          </h1>
          <p className="pr-sub">No hidden fees. No per-seat surprises. Cancel any time.</p>

          {/* Billing toggle */}
          <div className="pr-toggle-wrap">
            <span className={`pr-toggle-label${!yearly ? ' active' : ''}`}>Monthly</span>
            <button
              onClick={() => setYearly(v => !v)}
              className={`pr-pill${yearly ? ' on' : ''}`}
              aria-label="Toggle billing period"
            >
              <span className={`pr-knob${yearly ? ' on' : ''}`} />
            </button>
            <span className={`pr-toggle-label${yearly ? ' active' : ''}`}>
              Yearly <span className="pr-save">Save 35%</span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="pr-grid">
          {PLANS.map(plan => (
            <div key={plan.name} className={`pr-card${plan.highlight ? ' pr-card--featured' : ''}`}>
              {plan.badge && <div className="pr-badge">{plan.badge}</div>}
              <div className="pr-plan-name">{plan.name}</div>
              <div className="pr-price">
                {plan.price.monthly === 0 ? (
                  <span className="pr-amount">Free</span>
                ) : (
                  <>
                    <span className="pr-currency">$</span>
                    <span className="pr-amount">{yearly ? plan.price.yearly : plan.price.monthly}</span>
                    <span className="pr-period">/ mo</span>
                  </>
                )}
              </div>
              {yearly && plan.price.monthly > 0 && (
                <div className="pr-billed">Billed ${(plan.price.yearly * 12).toLocaleString()} / year</div>
              )}
              <p className="pr-blurb">{plan.blurb}</p>
              <a href={plan.href} className={`pr-cta${plan.highlight ? ' pr-cta--featured' : ''}`}>
                {plan.cta}
              </a>
              <ul className="pr-features">
                {plan.features.map(f => (
                  <li key={f} className="pr-feature">
                    <span className="pr-check">{CHECK}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="pr-faq">
          <h2 className="pr-faq-title">Common questions</h2>
          <div className="pr-faq-grid">
            {[
              { q: 'Can I switch plans?', a: 'Yes — upgrade or downgrade any time. Changes take effect immediately.' },
              { q: 'Is there a free trial?', a: 'Every paid plan starts with a 7-day free trial. No card required to start.' },
              { q: 'What payment methods?', a: 'We accept all major cards via Stripe. Local bank transfer available for Agency annual.' },
              { q: 'Do assets belong to me?', a: 'Completely. Everything generated from your Brand DNA is yours with no extra licensing.' },
            ].map(({ q, a }) => (
              <div key={q} className="pr-faq-item">
                <div className="pr-faq-q">{q}</div>
                <div className="pr-faq-a">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
