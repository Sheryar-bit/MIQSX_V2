'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './home.css';

const MARQUEE_SEG = 'BRAND DNA · CONSISTENCY · URDU + ENGLISH · ONE SYSTEM · ';
const MARQUEE = MARQUEE_SEG.repeat(4);

const FAQ_DATA = [
  { q: 'Can I use generated assets commercially?', a: 'Yes. Everything MIQSX produces from your Brand DNA is yours to use across client work, ads, and social — on Pro and Agency with no extra licensing.' },
  { q: 'Which languages does MIQSX speak?', a: 'English, Urdu, and Roman Urdu out of the box. Captions and copy are generated natively in all three, with a cultural check so nothing lands wrong.' },
  { q: 'How big a team can I add?', a: 'Free is solo. Pro covers up to 3 seats. Agency is built for studios — unlimited reviewers and client approval over WhatsApp.' },
  { q: 'What are the limits on the free tier?', a: 'One Brand DNA, 30 generated assets a month, and the full Guardian scoring so you can feel the workflow before you commit.' },
  { q: 'Does the brand really learn from feedback?', a: 'Every approval and rejection is logged against your Brand DNA. Over time the system internalises your taste and the off-brand suggestions stop appearing.' },
];

const SP = () => <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/>;

export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const theme = dark ? 'dark' : 'light';
  const year = new Date().getFullYear();
  const { data: session, status } = useSession();
  const loggedIn = status === 'authenticated';
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    const nav = document.getElementById('mqsx-nav') as HTMLElement | null;
    const onScroll = () => {
      if (!nav) return;
      const s = window.scrollY > 30;
      nav.style.background = s ? 'var(--nav-bg)' : 'transparent';
      nav.style.backdropFilter = s ? 'blur(16px) saturate(1.3)' : 'none';
      (nav.style as any).webkitBackdropFilter = s ? 'blur(16px) saturate(1.3)' : 'none';
      nav.style.boxShadow = s ? '0 8px 30px -14px rgba(33,28,18,0.22)' : 'none';
      nav.style.borderBottomColor = s ? 'var(--border)' : 'transparent';
      nav.style.paddingTop = s ? '12px' : '18px';
      nav.style.paddingBottom = s ? '12px' : '18px';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [mobileNavOpen]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
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

    requestAnimationFrame(() => {
      const els = document.querySelectorAll('[data-reveal]');
      els.forEach(el => {
        const d = el.getAttribute('data-reveal-delay') || '0';
        const e = el as HTMLElement;
        e.style.opacity = '0'; e.style.transform = 'translateY(26px)'; e.style.filter = 'blur(8px)';
        e.style.transition = `opacity .9s ${E} ${d}ms, transform .9s ${E} ${d}ms, filter .9s ease ${d}ms`;
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
      els.forEach(el => io.observe(el));

      document.querySelectorAll('[data-magnetic]').forEach(btn => {
        btn.addEventListener('mousemove', (ev) => {
          const e = ev as MouseEvent; const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2; const y = e.clientY - r.top - r.height / 2;
          (btn as HTMLElement).style.transform = `translate(${x * 0.22}px,${y * 0.32}px)`;
        });
        btn.addEventListener('mouseleave', () => { (btn as HTMLElement).style.transform = 'translate(0,0)'; });
      });

      document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (ev) => {
          const e = ev as MouseEvent; const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5; const py = (e.clientY - r.top) / r.height - 0.5;
          (card as HTMLElement).style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => { (card as HTMLElement).style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)'; });
      });

      const brandCard = document.querySelector('[data-card-tilt]') as HTMLElement | null;
      if (brandCard) {
        brandCard.addEventListener('mousemove', (ev) => {
          const e = ev as MouseEvent; const r = brandCard.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5; const py = (e.clientY - r.top) / r.height - 0.5;
          brandCard.style.transform = `perspective(700px) rotateY(${px * 11}deg) rotateX(${-py * 11}deg)`;
        });
        brandCard.addEventListener('mouseleave', () => { brandCard.style.transform = 'perspective(700px) rotateY(0) rotateX(0)'; });
      }
    });
  }, []);

  return (
    <div data-theme={theme} style={{ backgroundColor: 'var(--paper)', backgroundImage: 'radial-gradient(var(--line) 1.1px, transparent 1.1px)', backgroundSize: '30px 30px', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", minHeight: '100vh', overflowX: 'hidden', transition: 'background .6s cubic-bezier(.6,0,.2,1), color .6s cubic-bezier(.6,0,.2,1)', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}>

      {/* NAV */}
      <nav id="mqsx-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px clamp(20px, 5vw, 60px)', transition: 'background .4s ease, backdrop-filter .4s ease, box-shadow .4s ease, padding .4s ease', borderBottom: '1px solid transparent' } as React.CSSProperties}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '23px', letterSpacing: '-0.02em' }}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="var(--terra)" aria-hidden="true"><SP /></svg>MIQSX
        </a>
        <div className="mqsx-navlinks" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {([['About', '/about'], ['How it works', '/how-it-works'], ['Features', '/features'], ['Gallery', '/gallery'], ['Pricing', '/pricing']] as const).map(([label, href]) => (
            <a key={href} href={href} style={{ textDecoration: 'none', color: 'var(--dim)', fontSize: '15px', fontWeight: 500, padding: '8px 14px', borderRadius: '9px' }}>{label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <button onClick={() => setDark(d => !d)} aria-label="Toggle theme" style={{ position: 'relative', width: '54px', height: '29px', borderRadius: '999px', border: '1px solid var(--border)', background: 'var(--sand)', cursor: 'pointer', padding: 0, transition: 'background .4s', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '8px', fontSize: '11px', opacity: .7 }}>☀</span>
            <span style={{ position: 'absolute', right: '8px', fontSize: '10px', opacity: .7 }}>☾</span>
            <span style={{ position: 'absolute', top: '3px', left: dark ? '28px' : '3px', width: '23px', height: '23px', borderRadius: '50%', background: 'var(--ink)', transition: 'left .4s cubic-bezier(.6,0,.2,1)' }}></span>
          </button>
          {status === 'loading' ? (
            <span style={{ display: 'inline-block', width: 80, height: 36, borderRadius: 999, background: 'var(--line)', opacity: 0.5 }} />
          ) : loggedIn ? (
            <>
              <a href="/dashboard" data-magnetic className="mqsx-navstartfree" style={{ textDecoration: 'none', color: 'var(--paper)', fontSize: '15px', fontWeight: 600, padding: '11px 22px', borderRadius: '999px', background: 'var(--ink)', whiteSpace: 'nowrap' }}>Dashboard</a>
              <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--sig)', color: 'var(--onSig)', fontSize: '13px', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }} title="Profile">
                {initials}
              </a>
            </>
          ) : (
            <a href="/auth/signup" data-magnetic className="mqsx-navstartfree" style={{ textDecoration: 'none', color: 'var(--paper)', fontSize: '15px', fontWeight: 600, padding: '11px 22px', borderRadius: '999px', background: 'var(--ink)', whiteSpace: 'nowrap' }}>Start free</a>
          )}
          <button className={`mqsx-hamburger${mobileNavOpen ? ' open' : ''}`} onClick={() => setMobileNavOpen(v => !v)} aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileNavOpen}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      <div className={`mqsx-moboverlay${mobileNavOpen ? ' open' : ''}`} onClick={() => setMobileNavOpen(false)} />

      {/* Mobile nav drawer */}
      <div className={`mqsx-mobdrawer${mobileNavOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <a href="#top" onClick={() => setMobileNavOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '22px', letterSpacing: '-0.02em' }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="var(--terra)" aria-hidden="true"><SP /></svg>MIQSX
          </a>
          <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {([['About', '/about'], ['How it works', '/how-it-works'], ['Features', '/features'], ['Gallery', '/gallery'], ['Pricing', '/pricing']] as const).map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '21px', letterSpacing: '-0.02em', padding: '14px 0', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {label}<span style={{ color: 'var(--terra)', fontSize: '16px' }}>→</span>
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loggedIn ? (
            <>
              <a href="/profile" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--dim)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>{session?.user?.name ?? 'Profile'}</a>
              <a href="/dashboard" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--paper)', background: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '14px', borderRadius: '999px' }}>Dashboard →</a>
            </>
          ) : (
            <>
              <a href="/auth/login" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--dim)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>Sign in</a>
              <a href="/auth/signup" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--paper)', background: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '14px', borderRadius: '999px' }}>Start free →</a>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
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
              <a href="/auth/signup" data-fade data-magnetic style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '11px 11px 11px 28px', borderRadius: '999px', border: 'none', background: 'var(--sig)', color: 'var(--onSig)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(16px, 1.5vw, 19px)', cursor: 'pointer', textDecoration: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>Build your brand
                  <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--onSig)', color: 'var(--sig)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
                  </span>
                </span>
              </a>
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

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: 'clamp(76px, 11vh, 132px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ maxWidth: '760px', marginBottom: 'clamp(40px, 6vh, 66px)' }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> How it works</div>
          <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>A loop, not a launch.</h2>
          <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '54ch' }}>Your brand gets built, pressure-tested, signed off, and a little smarter — every single time you use it.</p>
        </div>
        <div className="mqsx-loop">
          <div data-reveal className="step step-card" style={{ transform: 'rotate(-1.2deg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--terra)', color: 'var(--terra-on)', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Day one</span>
            </div>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px' }}>Create</div>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>An AI strategist interviews you and builds your Brand DNA — voice, palette, audience.</p>
            <span style={{ marginTop: 'auto', alignSelf: 'flex-start', fontSize: '12px', padding: '5px 11px', borderRadius: '999px', background: 'var(--terra-soft)', color: 'var(--terra)' }}>Brand DNA ✦</span>
          </div>
          <div className="mqsx-arrowh" aria-hidden="true"><svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="var(--terra)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 C 16 3, 27 7, 34 22"/><path d="M26 21 L35 24 L34 14"/></svg></div>

          <div data-reveal data-reveal-delay="90" className="step step-card" style={{ transform: 'rotate(1deg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--olive)', color: 'var(--olive-on)', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Every asset</span>
            </div>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px' }}>Validate</div>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Guardian, a stress test, and a cultural check catch problems before anything ships.</p>
            <span style={{ marginTop: 'auto', alignSelf: 'flex-start', fontSize: '12px', padding: '5px 11px', borderRadius: '999px', background: 'color-mix(in oklab, var(--olive) 18%, transparent)', color: 'var(--olive)' }}>Scored 0–100</span>
          </div>
          <div className="mqsx-arrowh" aria-hidden="true"><svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="var(--terra)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22 C 12 7, 24 3, 37 9"/><path d="M30 4 L38 9 L29 13"/></svg></div>

          <div data-reveal data-reveal-delay="180" className="step step-card" style={{ transform: 'rotate(-1deg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--peri)', color: 'var(--peri-on)', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Sign-off</span>
            </div>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px' }}>Approve</div>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Your team reviews in one place; your client signs off over WhatsApp.</p>
            <span style={{ marginTop: 'auto', alignSelf: 'flex-start', fontSize: '12px', padding: '5px 11px', borderRadius: '999px', background: 'var(--peri-soft)', color: 'var(--peri-on)' }}>On WhatsApp</span>
          </div>
          <div className="mqsx-arrowh" aria-hidden="true"><svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="var(--terra)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 C 16 3, 27 7, 34 22"/><path d="M26 21 L35 24 L34 14"/></svg></div>

          <div data-reveal data-reveal-delay="270" className="step" style={{ position: 'relative', borderRadius: '20px', padding: '26px 22px', background: 'var(--olive)', color: 'var(--olive-on)', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '244px', overflow: 'hidden', transform: 'rotate(1.2deg)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)' }}>
            <svg className="mqsx-spin" width="90" height="90" viewBox="0 0 40 40" fill="rgba(255,255,255,0.07)" style={{ position: 'absolute', bottom: '-22px', right: '-22px' }} aria-hidden="true"><SP /></svg>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--butter)', color: 'var(--butter-on)', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>↻  and again</span>
            </div>
            <div style={{ position: 'relative', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px' }}>Learn</div>
            <p style={{ position: 'relative', fontSize: '14px', lineHeight: 1.55, opacity: .85, margin: 0 }}>Every yes and no trains the brand, so off-brand suggestions fade away — and the loop begins again.</p>
            <span style={{ position: 'relative', marginTop: 'auto', alignSelf: 'flex-start', fontSize: '12px', padding: '5px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)' }}>Smarter each time</span>
          </div>
        </div>
        <div data-reveal style={{ display: 'flex', justifyContent: 'center', marginTop: '26px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '17px', color: 'var(--dim)', padding: '9px 18px', borderRadius: '999px', border: '1px dashed var(--border)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/></svg>
            The loop never really stops — that&apos;s the point.
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ maxWidth: '780px', marginBottom: 'clamp(40px, 6vh, 64px)' }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> Features</div>
          <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>Generation is easy. <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500, color: 'var(--terra)' }}>Judgment</span> isn&apos;t.</h2>
          <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '56ch' }}>Anyone can spin up a logo now. MIQSX is the part that decides whether it belongs to your brand — and keeps it that way at scale.</p>
        </div>

        {/* Showcase A */}
        <div data-reveal className="mqsx-show" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)' }}>01</span>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>The foundation</span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.04, margin: '0 0 14px' }}>Brand DNA Engine</h3>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 20px', maxWidth: '44ch' }}>One living source of truth — voice, palette, type, audience, do&apos;s and don&apos;ts. Every other feature reads from it, so consistency isn&apos;t a checklist; it&apos;s simply the default.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['voice', 'palette', 'type', 'rules'].map(t => <span key={t} style={{ fontSize: '13px', padding: '7px 13px', borderRadius: '999px', border: '1px solid var(--border)', color: 'var(--ink)' }}>{t}</span>)}
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: '24px', background: 'var(--olive)', padding: 'clamp(24px, 3vw, 38px)', overflow: 'hidden', minHeight: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="mqsx-spin" width="130" height="130" viewBox="0 0 40 40" fill="rgba(255,255,255,0.07)" style={{ position: 'absolute', top: '-30px', right: '-30px' }} aria-hidden="true"><SP /></svg>
            <div style={{ position: 'relative', width: 'min(320px, 100%)', borderRadius: '18px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Brand DNA</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--on)' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--on)' }}></span>LIVE</span>
              </div>
              <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '14px' }}>Saffron &amp; Co.</div>
              <div style={{ display: 'flex', gap: '7px', marginBottom: '16px' }}>
                {['var(--terra)', 'var(--butter)', 'var(--peri)', 'var(--olive)'].map((bg, i) => <span key={i} style={{ flex: 1, height: '34px', borderRadius: '8px', background: bg }}></span>)}
              </div>
              <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '14px', color: 'var(--dim)', marginBottom: '16px' }}>Voice — warm, direct, a little playful.</div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Consistency</span>
                  <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '18px', fontWeight: 600, color: 'var(--olive)' }}>98</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: 'var(--line)', overflow: 'hidden' }}><div style={{ width: '98%', height: '100%', background: 'var(--olive)' }}></div></div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '18px', right: '18px', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: 'var(--butter-on)', background: 'var(--butter)', padding: '7px 12px', borderRadius: '999px', transform: 'rotate(-4deg)', boxShadow: 'var(--shadow-sm)' }}>
              <svg width="12" height="12" viewBox="0 0 40 40" fill="var(--butter-on)"><SP /></svg>auto-synced
            </div>
          </div>
        </div>

        {/* Trio */}
        <div className="mqsx-trio" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <div data-reveal className="trio-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'var(--terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z"/><path d="M9 12l2 2 4-4"/></svg></span>
              <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '17px', color: 'var(--terra)' }}>0–100</span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' }}>Brand Guardian</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Scores every asset against your DNA and tells you exactly what&apos;s off — before it ships.</p>
          </div>
          <div data-reveal data-reveal-delay="90" className="trio-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'var(--peri-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--peri-on)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18v12H7l-4 4z"/><path d="M7 9h10M7 13h6"/></svg></span>
              <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--peri-on)' }}>EN·<span style={{ fontFamily: "'Newsreader', serif" }}>اردو</span></span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' }}>Trilingual captions</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>English, Urdu and Roman Urdu — not translated, actually written natively for each.</p>
          </div>
          <div data-reveal data-reveal-delay="180" className="trio-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'var(--butter-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--butter-on)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 19c0-2 .8-3.4 2.3-4"/></svg></span>
              <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '17px', color: 'var(--butter-on)' }}>×12</span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' }}>AI Focus Group</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Test concepts on synthetic personas that sound like your real audience — before ad spend.</p>
          </div>
        </div>

        {/* Showcase B: WhatsApp */}
        <div data-reveal className="mqsx-show rev" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <div style={{ position: 'relative', borderRadius: '24px', background: 'var(--olive-deep)', padding: 'clamp(26px, 3vw, 40px)', overflow: 'hidden', minHeight: '290px', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '11px', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
              <div style={{ alignSelf: 'flex-end', maxWidth: '86%', background: '#25D366', color: '#062b14', padding: '12px 15px', borderRadius: '15px 15px 4px 15px', fontSize: '14px', fontWeight: 500 }}>Eid campaign — 3 posts ready for review 🌙</div>
              <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: 'rgba(255,255,255,0.12)', color: 'var(--olive-on)', padding: '12px 15px', borderRadius: '15px 15px 15px 4px', fontSize: '14px' }}>Approved! These look perfect 👍</div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '86%', background: '#25D366', color: '#062b14', padding: '12px 15px', borderRadius: '15px 15px 4px 15px', fontSize: '14px', fontWeight: 500 }}>Logged ✓ Brand just got smarter</div>
              <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--olive-on)', opacity: .7, paddingLeft: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--butter)' }}></span>Synced to Brand DNA</div>
            </div>
            <svg className="mqsx-spin" width="120" height="120" viewBox="0 0 40 40" fill="rgba(255,255,255,0.06)" style={{ position: 'absolute', bottom: '-28px', left: '-28px' }} aria-hidden="true"><SP /></svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)' }}>02</span>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>The workflow</span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.04, margin: '0 0 14px' }}>Sign-off on <span style={{ color: '#1faa52' }}>WhatsApp</span></h3>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 20px', maxWidth: '44ch' }}>Reviews happen where your clients already are. Send for approval, get a yes, and the brand learns from every decision — no portals, no chasing.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Team review', 'Client approval', 'Auto-logged'].map(t => <span key={t} style={{ fontSize: '13px', padding: '7px 13px', borderRadius: '999px', border: '1px solid var(--border)' }}>{t}</span>)}
            </div>
          </div>
        </div>

        {/* Calendar strip */}
        <div data-reveal style={{ borderRadius: '22px', background: 'var(--sand)', border: '1px solid var(--border)', padding: 'clamp(26px, 3vw, 36px)', display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg></span>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Built for here</span>
            </div>
            <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Desi Content Calendar</h3>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: '17px', lineHeight: 1.55, color: 'var(--dim)', margin: 0, maxWidth: '42ch' }}>Plans around the moments that actually move sales in Pakistan.</p>
          </div>
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
            {[
              { label: 'Eid', bg: 'var(--terra-soft)', color: 'var(--terra)', dot: 'var(--terra)' },
              { label: 'Independence Day', bg: 'var(--olive)', color: 'var(--olive-on)', dot: 'var(--butter)' },
              { label: 'Monsoon', bg: 'var(--peri-soft)', color: 'var(--peri-on)', dot: 'var(--peri)' },
              { label: 'Cricket season', bg: 'var(--butter-soft)', color: 'var(--butter-on)', dot: 'var(--butter)' },
              { label: 'Black Friday', bg: 'var(--card)', color: 'var(--ink)', dot: 'var(--terra)', border: '1px solid var(--border)' },
            ].map(item => (
              <span key={item.label} style={{ fontSize: '13.5px', padding: '9px 15px', borderRadius: '999px', background: item.bg, color: item.color, border: (item as any).border, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot }}></span>{item.label}
              </span>
            ))}
            <span style={{ fontSize: '13.5px', padding: '9px 15px', borderRadius: '999px', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--dim)' }}>+ wedding season</span>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ padding: 'clamp(56px, 9vh, 110px) 0', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--line)', background: 'var(--sand)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto 44px', padding: '0 clamp(20px, 5vw, 60px)' }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> Gallery</div>
          <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>Every asset, <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>one identity.</span></h2>
          <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '52ch' }}>Logos, palettes, posts, captions, type — generated from one DNA, scored on the way out. Hover to hold.</p>
        </div>
        <div className="mqsx-marquee" style={{ position: 'relative', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)' } as React.CSSProperties}>
          <div className="mqsx-track" style={{ display: 'flex', gap: '18px', width: 'max-content', padding: '18px clamp(20px, 5vw, 60px)' }}>
            {[0, 1].map(copy => (
              <div key={copy} style={{ display: 'contents' }}>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'color-mix(in oklab, var(--on) 16%, transparent)', color: 'var(--on)' }}>98 ✓</span>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 'auto' }}>Logo</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}><svg width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '33px', fontWeight: 600, letterSpacing: '-0.03em' }}>Saffron</span></div></div>
                  <span style={{ fontSize: '13px', color: 'var(--dim)' }}>Primary wordmark · clear-space locked</span>
                </div>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--terra)', color: 'var(--terra-on)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.9)', color: 'var(--terra)' }}>100 ✓</span>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7, marginBottom: '20px' }}>Palette</span>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px' }}>
                    <div style={{ borderRadius: '13px', background: 'var(--butter)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--butter-on)', fontSize: '10px', fontWeight: 600 }}>Butter</div>
                    <div style={{ borderRadius: '13px', background: 'var(--olive)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: '#fff', fontSize: '10px', fontWeight: 600 }}>Olive</div>
                    <div style={{ borderRadius: '13px', background: 'var(--peri)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--peri-on)', fontSize: '10px', fontWeight: 600 }}>Peri</div>
                    <div style={{ borderRadius: '13px', background: '#FBF3EC', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--terra)', fontSize: '10px', fontWeight: 600 }}>Paper</div>
                  </div>
                </div>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 2, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'color-mix(in oklab, var(--on) 16%, transparent)', color: 'var(--on)' }}>96 ✓</span>
                  <div style={{ height: '218px', background: 'linear-gradient(140deg, var(--terra), var(--butter))', position: 'relative' }}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 72% 28%, rgba(255,255,255,.34), transparent 52%)' }}></div><span style={{ position: 'absolute', bottom: '14px', left: '16px', color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '24px' }}>Eid ✦</span></div>
                  <div style={{ padding: '18px' }}><span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Instagram post</span><div style={{ fontSize: '14.5px', fontWeight: 600, lineHeight: 1.4, marginTop: '7px' }}>Eid sale is live — up to 40% off, only this week.</div></div>
                </div>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'color-mix(in oklab, var(--on) 16%, transparent)', color: 'var(--on)' }}>99 ✓</span>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Caption · 3 languages</span>
                  <div style={{ borderRadius: '12px', background: 'var(--peri-soft)', color: 'var(--peri-on)', padding: '13px', fontSize: '14px' }}>New collection just dropped 🌙</div>
                  <div style={{ borderRadius: '12px', background: 'var(--terra-soft)', color: 'var(--terra)', padding: '13px', fontSize: '15px', direction: 'rtl', textAlign: 'right' }}>نیا کلیکشن آ گیا ہے 🌙</div>
                  <div style={{ borderRadius: '12px', background: 'var(--sand)', border: '1px solid var(--line)', padding: '13px', fontSize: '14px', fontStyle: 'italic' }}>Naya collection aa gaya hai 🌙</div>
                </div>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--butter)', color: 'var(--butter-on)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(58,46,14,0.16)' }}>97 ✓</span>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .65, marginBottom: 'auto' }}>Typography</span>
                  <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '104px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.04em' }}>Aa</div>
                  <span style={{ marginTop: 'auto', fontSize: '13px', opacity: .75 }}>Schibsted · Newsreader</span>
                </div>
                <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', background: 'var(--olive)', color: 'var(--olive-on)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '13px', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.85)', color: 'var(--olive)' }}>95 ✓</span>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7 }}>Story · 9:16</span>
                  <div style={{ flex: 1, borderRadius: '13px', background: 'linear-gradient(160deg, var(--peri), var(--terra))', position: 'relative', overflow: 'hidden' }}><span style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', fontWeight: 600, lineHeight: 1.1 }}>Monsoon edit ☔</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE + STATS */}
      <section style={{ padding: 'clamp(76px, 12vh, 140px) clamp(20px, 5vw, 60px)', maxWidth: '1080px', margin: '0 auto' }}>
        <div data-reveal style={{ position: 'relative', textAlign: 'center' }}>
          <span className="mqsx-quote-pill" style={{ position: 'absolute', left: '-2%', top: '-36px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '30px', padding: '6px 14px', borderRadius: '999px', background: 'var(--terra-soft)', color: 'var(--terra)' }}>+ consistency</span>
          <span className="mqsx-quote-pill" style={{ position: 'absolute', right: '0%', top: '18%', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '26px', padding: '6px 14px', borderRadius: '999px', background: 'var(--peri-soft)', color: 'var(--peri-on)' }}>+ memory</span>
          <span className="mqsx-quote-pill" style={{ position: 'absolute', left: '4%', bottom: '6%', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '26px', padding: '6px 14px', borderRadius: '999px', background: 'var(--butter-soft)', color: 'var(--butter-on)' }}>+ local nuance</span>
          <blockquote style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 'clamp(26px, 4.2vw, 50px)', lineHeight: 1.22, letterSpacing: '-0.01em', margin: '0 auto', maxWidth: '20ch' }}>
            Studios here don&apos;t lose deals on talent. They lose them on <span style={{ fontStyle: 'italic', position: 'relative', whiteSpace: 'nowrap', color: 'var(--terra)' }}>consistency<svg viewBox="0 0 200 14" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: '-0.1em', width: '100%', height: '0.3em', overflow: 'visible' }} aria-hidden="true"><path d="M3 9 C 45 3, 70 12, 110 6 S 165 3, 197 8" fill="none" stroke="var(--terra)" strokeWidth="4" strokeLinecap="round"/></svg></span> — and the chaos of doing it all by hand.
          </blockquote>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '11px', marginTop: '30px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 40 40" fill="var(--butter)"><SP /></svg></span>
            <div style={{ textAlign: 'left' }}><div style={{ fontSize: '15px', fontWeight: 600 }}>The MIQSX team</div><div style={{ fontSize: '13px', color: 'var(--dim)' }}>Built in Karachi · DHA Suffa University</div></div>
          </div>
        </div>
        <div data-reveal data-reveal-delay="120" className="mqsx-stats-grid" style={{ marginTop: 'clamp(48px, 7vh, 80px)', borderRadius: '22px', background: 'var(--ink)', color: 'var(--paper)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', overflow: 'hidden' }}>
          {[{ val: '3×', label: 'faster turnaround', color: 'var(--butter)' }, { val: '100%', label: 'on-brand, every asset', color: 'var(--terra)' }, { val: '3', label: 'languages, native', color: 'var(--peri)' }, { val: '1', label: 'source of truth', color: 'var(--olive-on)' }].map((s, i) => (
            <div key={i} style={{ padding: 'clamp(28px, 4vw, 44px)', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : undefined }}>
              <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(38px, 5.5vw, 58px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '14px', opacity: .7, marginTop: '8px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: 'clamp(56px, 9vh, 110px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto clamp(40px, 6vh, 60px)' }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> See the difference</div>
          <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>The same Eid campaign, <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>two ways.</span></h2>
        </div>
        <div data-reveal style={{ position: 'relative' }}>
          <div className="mqsx-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(26px, 4vw, 54px)', alignItems: 'stretch' }}>
            <div style={{ borderRadius: '24px', background: 'var(--sand)', border: '1px solid var(--border)', padding: 'clamp(24px, 3vw, 36px)', display: 'flex', flexDirection: 'column', transform: 'rotate(-1deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '20px', fontWeight: 600, color: 'var(--dim)' }}>By hand</span><span style={{ fontSize: '12px', color: 'var(--dim)' }}>the old way</span></div>
              <div style={{ borderRadius: '14px', height: '120px', background: 'repeating-linear-gradient(45deg, #B9A98C, #B9A98C 12px, #C7B79A 12px, #C7B79A 24px)', position: 'relative', marginBottom: '20px', overflow: 'hidden' }}><span style={{ position: 'absolute', bottom: '10px', left: '12px', color: 'rgba(31,27,18,0.55)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '17px' }}>off-brand draft</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '14px', color: 'var(--ink)', marginBottom: '22px' }}>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✕</span> Colors drift every post</span>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✕</span> Caption in English only</span>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✕</span> 4 tools, ~3 hours, 2 revisions</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--terra)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '24px', color: 'var(--terra)' }}>61</div>
                <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.4 }}>consistency score<br /><span style={{ color: 'var(--terra)', fontWeight: 600 }}>needs work</span></div>
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: '24px', background: 'var(--card)', border: '1px solid var(--border)', padding: 'clamp(24px, 3vw, 36px)', display: 'flex', flexDirection: 'column', transform: 'rotate(1deg)', boxShadow: 'var(--shadow)' }}>
              <div style={{ position: 'absolute', top: '-16px', right: '-10px', width: '66px', height: '66px', borderRadius: '50%', background: 'var(--olive)', color: 'var(--olive-on)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: 'rotate(11deg)', boxShadow: 'var(--shadow-sm)', border: '2px dashed rgba(255,255,255,0.4)' }}><svg width="13" height="13" viewBox="0 0 40 40" fill="currentColor"><SP /></svg><span style={{ fontSize: '8.5px', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: '1px' }}>winner</span></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '20px', fontWeight: 600 }}><svg width="16" height="16" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg>With MIQSX</span><span style={{ fontSize: '12px', color: 'var(--olive)' }}>on-brand</span></div>
              <div style={{ borderRadius: '14px', height: '120px', background: 'linear-gradient(140deg, var(--terra), var(--butter))', position: 'relative', marginBottom: '20px', overflow: 'hidden' }}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 74% 26%, rgba(255,255,255,.34), transparent 52%)' }}></div><span style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '19px' }}>Eid sale ✦</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '14px', color: 'var(--ink)', marginBottom: '22px' }}>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--olive)' }}>✓</span> On-brand palette, locked</span>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--olive)' }}>✓</span> EN · اردو · Roman Urdu</span>
                <span style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--olive)' }}>✓</span> One place, ~8 minutes, signed off</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '24px', color: 'var(--olive-on)' }}>98</div>
                <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.4 }}>consistency score<br /><span style={{ color: 'var(--olive)', fontWeight: 600 }}>ship it</span></div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 6, width: '58px', height: '58px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '16px', boxShadow: 'var(--shadow)', border: '3px solid var(--paper)' }}>vs</div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: 'clamp(56px, 8vh, 100px) clamp(20px, 5vw, 60px) clamp(76px, 11vh, 130px)', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(40px, 6vh, 62px)' }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> Pricing</div>
          <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>Start free. <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>Scale</span> when it pays off.</h2>
          <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '16px 0 0' }}>Built for Pakistani pricing. No card needed to begin.</p>
        </div>
        <div className="mqsx-price">
          <div data-reveal style={{ borderRadius: '22px', border: '1px solid var(--border)', background: 'var(--card)', padding: 'clamp(26px, 3vw, 36px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>Free</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', color: 'var(--dim)', margin: '6px 0 22px' }}>Feel the workflow, solo.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>PKR</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>0</span></div>
            <a href="/auth/signup" style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>Start free</a>
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
              <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>Pro</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--butter-on)', padding: '6px 12px', borderRadius: '999px', background: 'var(--butter)' }}><svg width="11" height="11" viewBox="0 0 40 40" fill="var(--butter-on)"><SP /></svg>Most loved</span>
            </div>
            <p style={{ position: 'relative', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', opacity: .85, margin: '6px 0 22px' }}>For working freelancers.</p>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', opacity: .75 }}>PKR</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>999</span><span style={{ fontSize: '14px', opacity: .75 }}>/mo</span></div>
            <a href="/auth/signup" data-magnetic style={{ position: 'relative', textDecoration: 'none', textAlign: 'center', color: 'var(--butter-on)', fontSize: '15px', fontWeight: 600, padding: '14px', borderRadius: '999px', background: 'var(--butter)' }}>Go Pro</a>
            <div style={{ position: 'relative', height: '1px', background: 'rgba(255,255,255,0.18)', margin: '24px 0' }}></div>
            <ul style={{ position: 'relative', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '14px' }}>
              {['Everything in Free', 'Unlimited assets', 'Up to 3 seats', 'Trilingual + AI Focus Group', 'WhatsApp approvals'].map(f => <li key={f} style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--butter)' }}>✓</span> {f}</li>)}
            </ul>
          </div>
          <div data-reveal data-reveal-delay="160" style={{ borderRadius: '22px', border: '1px solid var(--border)', background: 'var(--card)', padding: 'clamp(26px, 3vw, 36px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600 }}>Agency</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '15px', color: 'var(--dim)', margin: '6px 0 22px' }}>For studios running many brands.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>PKR</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>2,499</span><span style={{ fontSize: '14px', color: 'var(--dim)' }}>/mo</span></div>
            <a href="/auth/signup" style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--ink)', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '999px', border: '1px solid var(--border)' }}>Talk to us</a>
            <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '14px' }}>
              {['Everything in Pro', 'Unlimited brands & seats', 'Client sign-off workflows', 'Priority support'].map(f => <li key={f} style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--terra)' }}>✓</span> {f}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: 'clamp(56px, 9vh, 110px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto', borderTop: '1px solid var(--line)' }}>
        <div className="mqsx-faq">
          <div data-reveal style={{ position: 'sticky', top: '110px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> FAQ</div>
            <h2 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(30px, 4.4vw, 52px)', lineHeight: 1.04, letterSpacing: '-0.03em', margin: 0 }}>Questions,<br /><span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>answered.</span></h2>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: '17px', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '30ch' }}>Still unsure? Reach us on WhatsApp and a human replies same-day.</p>
          </div>
          <div data-reveal data-reveal-delay="80" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_DATA.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ borderRadius: '16px', border: `1px solid ${open ? 'var(--border)' : 'var(--line)'}`, background: open ? 'var(--card)' : 'transparent', overflow: 'hidden', transition: 'background .3s, border-color .3s' }}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(15.5px, 1.9vw, 17.5px)', fontWeight: 600 }}>
                    <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '18px', color: 'var(--terra)', flex: '0 0 auto' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1 }}>{faq.q}</span>
                    <span style={{ flex: '0 0 auto', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', color: 'var(--terra)', fontWeight: 500, lineHeight: 1 }}>{open ? '−' : '+'}</span>
                  </button>
                  <div style={{ overflow: 'hidden', transition: 'max-height .45s cubic-bezier(.2,.7,.2,1), opacity .35s ease', maxHeight: open ? '260px' : '0px', opacity: open ? 1 : 0 }}>
                    <p style={{ margin: 0, padding: '0 22px 22px 60px', fontSize: '15px', lineHeight: 1.6, color: 'var(--dim)', maxWidth: '60ch' }}>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(40px, 7vh, 90px) clamp(20px, 5vw, 60px) clamp(70px, 11vh, 130px)', maxWidth: '1180px', margin: '0 auto' }}>
        <div data-reveal style={{ position: 'relative', borderRadius: '30px', overflow: 'hidden', padding: 'clamp(40px, 6vw, 80px) clamp(28px, 5vw, 68px)', background: 'var(--olive-deep)', color: 'var(--olive-on)' }}>
          <svg className="mqsx-spin" width="200" height="200" viewBox="0 0 40 40" fill="rgba(255,255,255,0.06)" style={{ position: 'absolute', top: '-56px', right: '-46px' }} aria-hidden="true"><SP /></svg>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ position: 'absolute', bottom: '12%', left: '7%', animation: 'mqsx-twinkle 3.2s ease-in-out infinite' }} aria-hidden="true"><path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z"/></svg>
          <div className="mqsx-show" style={{ position: 'relative', gridTemplateColumns: '1.18fr 0.82fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '18px', color: 'var(--butter)', marginBottom: '16px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--butter)"><SP /></svg> Ready when you are</div>
              <h2 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(30px, 4.6vw, 60px)', lineHeight: 1.04, letterSpacing: '-0.03em', margin: 0, maxWidth: '15ch' }}>Your brand deserves a system, not a <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500, color: 'var(--butter)' }}>one-off.</span></h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '30px' }}>
                <a href="/auth/signup" data-magnetic style={{ textDecoration: 'none', color: 'var(--ink)', background: 'var(--paper)', fontSize: '16px', fontWeight: 600, padding: '15px 30px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>Build your brand <span style={{ display: 'inline-flex', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--terra)', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px' }}>→</span></a>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="42" height="32" viewBox="0 0 42 32" fill="none" stroke="var(--butter)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M39 8 C 24 4, 10 8, 5 24"/><path d="M2 16 L6 25 L14 22"/></svg>
                  <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '16px', color: 'var(--butter)' }}>no card needed</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', justifySelf: 'center' }}>
              <div style={{ position: 'relative', width: '230px', borderRadius: '20px', background: 'var(--card)', color: 'var(--ink)', boxShadow: 'var(--shadow)', padding: '24px', transform: 'rotate(3deg)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim)' }}>Free forever</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '8px 0 16px' }}><span style={{ fontSize: '13px', color: 'var(--dim)' }}>PKR</span><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '44px', fontWeight: 600, letterSpacing: '-0.02em' }}>0</span></div>
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

      {/* FOOTER */}
      <footer style={{ position: 'relative', background: '#1A1510', color: '#F3EEDF', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.1px, transparent 1.1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }}></div>
        <svg className="mqsx-spin" width="150" height="150" viewBox="0 0 40 40" fill="rgba(255,255,255,0.04)" style={{ position: 'absolute', top: '30px', right: '4%' }} aria-hidden="true"><SP /></svg>
        <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(48px, 7vh, 80px) clamp(20px, 5vw, 60px) 0', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '300px' }}>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#F3EEDF', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '14px' }}><svg width="22" height="22" viewBox="0 0 40 40" fill="#C75D39"><SP /></svg>MIQSX</a>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: '15px', lineHeight: 1.6, color: 'rgba(243,238,223,0.68)', margin: '0 0 18px' }}>The AI Brand Operating System. One Brand DNA — every asset stays on-brand.</p>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '999px', padding: '5px 5px 5px 16px', maxWidth: '290px' }}>
              <input type="email" placeholder="Monthly brand tips" style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#F3EEDF', fontFamily: 'inherit', fontSize: '13.5px' }} />
              <button type="submit" aria-label="Subscribe" style={{ flex: '0 0 auto', width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: '#C75D39', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>→</button>
            </form>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(36px, 5vw, 64px)', flexWrap: 'wrap' }}>
            {[
              { heading: 'Product', links: [{ label: 'How it works', href: '/how-it-works' }, { label: 'Features', href: '/features' }, { label: 'Gallery', href: '/gallery' }, { label: 'Pricing', href: '/pricing' }] },
              { heading: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Sign in', href: '/auth/login' }] },
              { heading: 'Social', links: [{ label: 'Instagram', href: '/' }, { label: 'WhatsApp', href: '/' }, { label: 'LinkedIn', href: '/' }] },
            ].map(col => (
              <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(243,238,223,0.45)', marginBottom: '2px' }}>{col.heading}</div>
                {col.links.map(link => <a key={link.label} href={link.href} style={{ textDecoration: 'none', color: 'rgba(243,238,223,0.8)', fontSize: '14px' }}>{link.label}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', maxWidth: '1180px', margin: 'clamp(34px, 5vh, 56px) auto 0', padding: '0 clamp(20px, 5vw, 60px)', overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(74px, 19vw, 252px)', lineHeight: 0.8, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.18)', whiteSpace: 'nowrap' } as React.CSSProperties}>MIQSX</div>
        </div>
        <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 auto', padding: '22px clamp(20px, 5vw, 60px) 32px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'rgba(243,238,223,0.55)' }}>© {year} MIQSX — all rights reserved</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(243,238,223,0.8)', padding: '7px 14px', borderRadius: '999px', border: '1px dashed rgba(255,255,255,0.25)', transform: 'rotate(-2deg)' }}><svg width="12" height="12" viewBox="0 0 40 40" fill="#C75D39"><SP /></svg> Made in Karachi · DHA Suffa University · 🇵🇰</span>
        </div>
      </footer>
    </div>
  );
}
