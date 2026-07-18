'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SP } from './Sparkle';

export default function CtaSection() {
  const { status } = useSession();
  const ctaHref = status === 'authenticated' ? '/dashboard' : '/auth/signup';

  return (
    <section style={{ padding: 'clamp(40px, 7vh, 90px) clamp(20px, 5vw, 60px) clamp(70px, 11vh, 130px)', maxWidth: '1180px', margin: '0 auto' }}>
      <div data-reveal style={{ position: 'relative', borderRadius: '30px', overflow: 'hidden', padding: 'clamp(40px, 6vw, 80px) clamp(28px, 5vw, 68px)', background: 'var(--olive-deep)', color: 'var(--olive-on)' }}>
        <svg className="mqsx-spin" width="200" height="200" viewBox="0 0 40 40" fill="rgba(255,255,255,0.06)" style={{ position: 'absolute', top: '-56px', right: '-46px' }} aria-hidden="true"><SP /></svg>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ position: 'absolute', bottom: '12%', left: '7%', animation: 'mqsx-twinkle 3.2s ease-in-out infinite' }} aria-hidden="true"><path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z"/></svg>
        <div className="mqsx-show" style={{ position: 'relative', gridTemplateColumns: '1.18fr 0.82fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '18px', color: 'var(--butter)', marginBottom: '16px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--butter)"><SP /></svg> Ready when you are</div>
            <h2 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(30px, 4.6vw, 60px)', lineHeight: 1.04, letterSpacing: '-0.03em', margin: 0, maxWidth: '15ch' }}>Your brand deserves a system, not a <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500, color: 'var(--butter)' }}>one-off.</span></h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '30px' }}>
              <Link href={ctaHref} data-magnetic style={{ textDecoration: 'none', color: 'var(--ink)', background: 'var(--paper)', fontSize: '16px', fontWeight: 600, padding: '15px 30px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>Build your brand <span style={{ display: 'inline-flex', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--terra)', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px' }}>→</span></Link>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="42" height="32" viewBox="0 0 42 32" fill="none" stroke="var(--butter)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M39 8 C 24 4, 10 8, 5 24"/><path d="M2 16 L6 25 L14 22"/></svg>
                <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '16px', color: 'var(--butter)' }}>no card needed</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', justifySelf: 'center' }}>
            <div style={{ position: 'relative', width: '230px', borderRadius: '20px', background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)', padding: '24px', transform: 'rotate(3deg)' }}>
              <div style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Free forever</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '8px 0 16px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>$</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '44px', fontWeight: 600, letterSpacing: '-0.02em' }}>0</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <span style={{ display: 'flex', gap: '9px' }}><span style={{ color: 'var(--olive)' }}>✓</span> 1 Brand DNA</span>
                <span style={{ display: 'flex', gap: '9px' }}><span style={{ color: 'var(--olive)' }}>✓</span> 30 assets / month</span>
                <span style={{ display: 'flex', gap: '9px' }}><span style={{ color: 'var(--olive)' }}>✓</span> Full Guardian scoring</span>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '-18px', left: '-18px', width: '70px', height: '70px', borderRadius: '50%', background: 'var(--terra)', color: 'var(--terra-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '18px', transform: 'rotate(-12deg)', boxShadow: 'var(--shadow-sm)', border: '2px dashed rgba(255,255,255,0.4)', animation: 'mqsx-float 5s ease-in-out infinite' }}>free!</div>
          </div>
        </div>
      </div>
    </section>
  );
}
