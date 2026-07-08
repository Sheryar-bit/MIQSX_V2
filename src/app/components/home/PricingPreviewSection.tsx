import Link from 'next/link';
import { SP } from './Sparkle';
import { PLANS } from '../../pricing/plans';

const [FREE, PRO, AGENCY] = PLANS;

export default function PricingPreviewSection() {
  return (
    <section id="pricing" style={{ padding: 'clamp(56px, 8vh, 100px) clamp(20px, 5vw, 60px) clamp(76px, 11vh, 130px)', maxWidth: '1180px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(40px, 6vh, 62px)' }}>
        <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> Pricing</div>
        <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>Start free. <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>Scale</span> when it pays off.</h2>
        <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '16px 0 0' }}>No hidden fees. No card needed to begin.</p>
      </div>
      <div className="mqsx-price">
        <div data-reveal style={{ borderRadius: '22px', border: '1px solid var(--border)', background: 'var(--card)', padding: 'clamp(26px, 3vw, 36px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>{FREE.name}</div>
          <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', color: 'var(--dim)', margin: '6px 0 22px' }}>Feel the workflow, solo.</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>$</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>{FREE.price.monthly}</span></div>
          <Link href={FREE.href} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>Start free</Link>
          <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '14px' }}>
            <li style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✓</span> 1 Brand DNA</li>
            <li style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✓</span> 30 assets / month</li>
            <li style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✓</span> Full Guardian scoring</li>
            <li style={{ display: 'flex', gap: '10px', color: 'var(--dim)' }}><span style={{ opacity: .4 }}>—</span> Solo seat</li>
          </ul>
        </div>
        <div data-reveal data-reveal-delay="80" style={{ position: 'relative', borderRadius: '22px', background: 'var(--olive)', color: 'var(--olive-on)', padding: 'clamp(30px, 3vw, 40px) clamp(26px, 3vw, 36px)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <svg className="mqsx-spin" width="130" height="130" viewBox="0 0 40 40" fill="rgba(255,255,255,0.06)" style={{ position: 'absolute', bottom: '-30px', left: '-30px' }} aria-hidden="true"><SP /></svg>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>{PRO.name}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--butter-on)', padding: '6px 12px', borderRadius: '999px', background: 'var(--butter)' }}><svg width="11" height="11" viewBox="0 0 40 40" fill="var(--butter-on)"><SP /></svg>Most loved</span>
          </div>
          <p style={{ position: 'relative', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', opacity: .85, margin: '6px 0 22px' }}>For working freelancers.</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', opacity: .75 }}>$</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>{PRO.price.monthly}</span><span style={{ fontSize: '14px', opacity: .75 }}>/mo</span></div>
          <Link href={PRO.href} data-magnetic style={{ position: 'relative', textDecoration: 'none', textAlign: 'center', color: 'var(--butter-on)', fontSize: '15px', fontWeight: 600, padding: '14px', borderRadius: '999px', background: 'var(--butter)' }}>Go Pro</Link>
          <div style={{ position: 'relative', height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>
          <ul style={{ position: 'relative', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '14px' }}>
            {['Everything in Free', 'Unlimited assets', 'Up to 3 seats', 'Trilingual + AI Focus Group', 'WhatsApp approvals'].map(f => <li key={f} style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--butter)' }}>✓</span> {f}</li>)}
          </ul>
        </div>
        <div data-reveal data-reveal-delay="160" style={{ borderRadius: '22px', border: '1px solid var(--border)', background: 'var(--card)', padding: 'clamp(26px, 3vw, 36px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>{AGENCY.name}</div>
          <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', color: 'var(--dim)', margin: '6px 0 22px' }}>For studios running many brands.</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>$</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>{AGENCY.price.monthly}</span><span style={{ fontSize: '14px', color: 'var(--dim)' }}>/mo</span></div>
          <Link href={AGENCY.href} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>Talk to us</Link>
          <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '14px' }}>
            {['Everything in Pro', 'Unlimited brands & seats', 'Client sign-off workflows', 'Priority support'].map(f => <li key={f} style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✓</span> {f}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
