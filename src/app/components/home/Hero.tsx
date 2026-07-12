'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { SP } from './Sparkle';

const MARQUEE_SEG = 'BRAND DNA · CONSISTENCY · URDU + ENGLISH · ONE SYSTEM · ';
const MARQUEE = MARQUEE_SEG.repeat(4);

export default function Hero() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const E = 'cubic-bezier(.2,.7,.2,1)';
    const spring = 'cubic-bezier(.34,1.56,.64,1)';

    const words = [...document.querySelectorAll('[data-word]')].sort((a, b) => +(a.getAttribute('data-i') || 0) - +(b.getAttribute('data-i') || 0));
    words.forEach(w => { const el = w as HTMLElement; el.style.opacity = '0'; el.style.filter = 'blur(12px)'; el.style.transform = 'translateY(20px)'; });
    const fades = [...document.querySelectorAll('[data-fade]')] as HTMLElement[];
    fades.forEach(f => { f.style.opacity = '0'; f.style.transform = 'translateY(14px)'; });

    const revealHero = () => {
      words.forEach((w, i) => {
        const el = w as HTMLElement;
        el.style.transition = `opacity .7s ${E} ${i * 80}ms, filter .7s ${E} ${i * 80}ms, transform .7s ${E} ${i * 80}ms`;
        el.style.opacity = '1'; el.style.filter = 'none'; el.style.transform = 'none';
      });
      const fbase = words.length * 80 + 120;
      fades.forEach((f, i) => {
        f.style.transition = `opacity .6s ${E} ${fbase + i * 90}ms, transform .6s ${E} ${fbase + i * 90}ms`;
        f.style.opacity = '1'; f.style.transform = 'none';
      });
      const tbase = fbase + 200;
      document.querySelectorAll('[data-arrow]').forEach((p, i) => {
        try {
          const path = p as SVGPathElement; const len = path.getTotalLength();
          path.style.strokeDasharray = String(len); path.style.strokeDashoffset = String(len);
          path.style.transition = `stroke-dashoffset .7s ${E} ${tbase + i * 220}ms`;
          requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
        } catch (_) {}
      });
      const tags = [...document.querySelectorAll('[data-tag]')] as HTMLElement[];
      const popBase = tbase + 300;
      tags.forEach((t, i) => {
        t.style.animation = 'none'; t.style.opacity = '0'; t.style.transform = 'scale(.55)';
        t.style.transition = `opacity .5s ${E} ${popBase + i * 90}ms, transform .55s ${spring} ${popBase + i * 90}ms`;
        requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
        setTimeout(() => { t.style.transition = ''; t.style.transform = ''; t.style.animation = ''; }, popBase + i * 90 + 600);
      });
    };
    setTimeout(revealHero, 60);
    setTimeout(() => {
      words.forEach(w => { const el = w as HTMLElement; el.style.opacity = '1'; el.style.filter = 'none'; el.style.transform = 'none'; });
      fades.forEach(f => { f.style.opacity = '1'; f.style.transform = 'none'; });
      document.querySelectorAll('[data-tag]').forEach(t => { (t as HTMLElement).style.opacity = '1'; (t as HTMLElement).style.transform = ''; });
    }, 2600);

    const brandCard = document.querySelector('[data-card-tilt]') as HTMLElement | null;
    if (!brandCard) return;
    const onMove = (ev: Event) => {
      const e = ev as MouseEvent; const r = brandCard.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; const py = (e.clientY - r.top) / r.height - 0.5;
      brandCard.style.transform = `perspective(700px) rotateY(${px * 11}deg) rotateX(${-py * 11}deg)`;
    };
    const onLeave = () => { brandCard.style.transform = 'perspective(700px) rotateY(0) rotateX(0)'; };
    brandCard.addEventListener('mousemove', onMove);
    brandCard.addEventListener('mouseleave', onLeave);
    return () => { brandCard.removeEventListener('mousemove', onMove); brandCard.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <section id="top" style={{ position: 'relative' }}>
      <div style={{ position: 'relative', background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)', overflow: 'hidden', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '22%', left: '30%', width: '60vw', height: '60vw', maxWidth: '760px', maxHeight: '760px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, var(--sig), transparent 55%), radial-gradient(circle at 70% 65%, var(--terra), transparent 55%)', opacity: .14, filter: 'blur(60px)', animation: 'h-blob 22s ease-in-out infinite', pointerEvents: 'none' }}></div>
        <div className="h-grain" aria-hidden="true"></div>

        <section style={{ position: 'relative', zIndex: 20, maxWidth: '1320px', margin: '0 auto', padding: 'clamp(94px, 13vh, 138px) clamp(20px, 5vw, 60px) 0' }}>
          {/* floating brand card */}
          <div className="mqsx-hero-card" style={{ position: 'absolute', top: 'clamp(54px, 11vh, 150px)', right: 'clamp(16px, 4vw, 56px)', zIndex: 16, display: 'flex', alignItems: 'center', gap: '2px', pointerEvents: 'none' }}>
            <svg width="96" height="80" viewBox="0 0 96 80" fill="none" style={{ overflow: 'visible', flex: '0 0 auto' }}>
              <path data-arrow d="M4 56 C 30 24, 54 22, 84 38" stroke="var(--terra)" strokeWidth="3" strokeLinecap="round"/>
              <path data-arrow d="M72 26 L88 38 L72 50" stroke="var(--terra)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ animation: 'h-bob 6.5s ease-in-out infinite', pointerEvents: 'auto' }}>
              <div data-card-tilt style={{ width: '248px', borderRadius: '18px', background: 'color-mix(in oklab, var(--surface) 60%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid var(--line-h)', boxShadow: '0 26px 60px -28px rgba(0,0,0,.5)', padding: '16px', transition: 'transform .25s ease', willChange: 'transform' } as React.CSSProperties}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'var(--terra)', transform: 'rotate(12deg)' }}></span>Saffron
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Brand Kit</span>
                </div>
                <div style={{ display: 'flex', gap: '7px', marginBottom: '14px' }}>
                  {['var(--h-terra)', 'var(--h-olive)', 'var(--h-sig)', 'var(--h-ink)'].map((bg, i) => (
                    <span key={i} style={{ flex: 1, height: '30px', borderRadius: '7px', background: bg }}></span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line-h)', paddingTop: '12px' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Consistency</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '13px', color: '#fff', background: 'var(--leaf)', padding: '4px 10px', borderRadius: '999px' }}>98 ✓</span>
                </div>
              </div>
            </div>
          </div>

          <div data-fade style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 'clamp(22px, 4vh, 44px)' }}>
            <span style={{ width: '30px', height: '1px', background: 'var(--terra)' }}></span>Brand, on autopilot
          </div>

          <h1 className="h-head">
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 clamp(14px, 1.6vw, 30px)' }}>
              {['RUN', 'YOUR', 'BRAND'].map((w, i) => <span key={i} data-word data-i={String(i)} style={{ display: 'inline-block' }}>{w}</span>)}
            </span>
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 clamp(14px, 1.6vw, 30px)', marginTop: 'clamp(4px, 0.6vh, 10px)' }}>
              <span data-word data-i="3" style={{ display: 'inline-block' }}>DON&apos;T</span>
              <span data-word data-i="4" style={{ display: 'inline-block' }}>JUST</span>
              <span data-word data-i="5" style={{ display: 'inline-block', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--sig)', paddingRight: '0.06em' }}>design</span>
              <span data-word data-i="6" style={{ display: 'inline-block' }}>IT.</span>
            </span>
          </h1>

          <svg data-fade aria-hidden="true" width="34" height="34" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: 'absolute', left: 'clamp(16px, 4vw, 56px)', top: 'clamp(40px, 8vh, 96px)', animation: 'h-twinkle 3.4s ease-in-out infinite', pointerEvents: 'none', zIndex: 14 }}><SP /></svg>
          <span data-fade aria-hidden="true" style={{ position: 'absolute', left: 'clamp(180px, 22vw, 380px)', top: 'clamp(20px, 5vh, 64px)', fontFamily: "'Newsreader', serif", fontSize: '40px', color: 'var(--olive)', animation: 'h-spin 14s linear infinite', transformOrigin: '50% 56%', pointerEvents: 'none', zIndex: 14 }}>✳</span>

          <div data-fade style={{ marginTop: 'clamp(22px, 3.5vh, 40px)', fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(11px, 1vw, 13px)', lineHeight: 1.7, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            An AI Brand Operating System<br />For freelancers &amp; agencies · <span style={{ color: 'var(--terra)' }}>made in Pakistan</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'clamp(20px, 4vw, 56px)', flexWrap: 'wrap', marginTop: 'clamp(30px, 5vh, 52px)' }}>
            <Link href="/auth/signup" data-fade data-magnetic style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '11px 11px 11px 28px', borderRadius: '999px', border: 'none', background: 'var(--sig)', color: 'var(--onSig)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(16px, 1.5vw, 19px)', cursor: 'pointer', textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>Build your brand
                <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--onSig)', color: 'var(--sig)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
                </span>
              </span>
            </Link>
            <a data-fade data-seework href="#how" style={{ textDecoration: 'none', color: 'var(--ink)', fontWeight: 600, fontSize: 'clamp(16px, 1.5vw, 19px)', display: 'inline-flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>See it work <span style={{ color: 'var(--terra)' }}>↓</span></a>
            <div aria-hidden="true" className="mqsx-cta-arrow" style={{ position: 'absolute', left: 'clamp(150px, 26vw, 340px)', top: '46px', width: '150px', height: '110px', pointerEvents: 'none', zIndex: 6 }}>
              <svg width="150" height="110" viewBox="0 0 150 110" fill="none" style={{ overflow: 'visible' }}>
                <path data-arrow d="M14 8 C 4 48, 30 78, 84 88" stroke="var(--terra)" strokeWidth="3" strokeLinecap="round"/>
                <path data-arrow d="M64 74 L88 90 L66 102" stroke="var(--terra)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="h-tagwrap">
            {[
              { label: 'Brand DNA', color: 'var(--olive)', dur: 6, delay: '0s', pos: { left: '3%', top: '12%' } },
              { label: 'Logo + Vector', color: 'var(--terra)', dur: 7, delay: '.4s', pos: { left: '37%', top: '10%' } },
              { label: 'Brand Guardian ✓', color: 'var(--leaf)', dur: 6.5, delay: '.2s', pos: { right: '2%', top: '14%' }, bold: true },
              { label: 'Trilingual Captions', color: 'var(--sig)', dur: 7.5, delay: '.6s', pos: { left: '14%', top: '60%' } },
              { label: 'AI Focus Group', color: 'var(--terra)', dur: 6.8, delay: '.35s', pos: { left: '46%', top: '62%' } },
              { label: 'WhatsApp Approval', color: 'var(--olive)', dur: 7.2, delay: '.5s', pos: { right: '5%', top: '58%' } },
            ].map((tag, i) => (
              <span key={i} data-tag data-i={String(i)} style={{ position: 'absolute', pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: '9px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: tag.bold ? 700 : 500, letterSpacing: '.02em', color: tag.bold ? tag.color : 'var(--ink)', animation: `h-bob ${tag.dur}s ease-in-out infinite ${tag.delay}`, cursor: 'default', ...tag.pos }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: tag.color, flex: '0 0 auto' }}></span>{tag.label}
              </span>
            ))}
          </div>
        </section>

        <div style={{ position: 'relative', zIndex: 20, marginTop: 'clamp(16px, 3vh, 30px)', borderTop: '1px solid var(--line-h)', borderBottom: '1px solid var(--line-h)', padding: '14px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="h-marq-track" style={{ display: 'inline-flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{MARQUEE}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{MARQUEE}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
