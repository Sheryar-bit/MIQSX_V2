'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../hooks/useTheme';
import './about.css';
import SharedNav from '../components/SharedNav';
import MarketingFooter from '../components/MarketingFooter';

export default function AboutPage() {
  const [dark, setDark] = useTheme();

  useEffect(() => {
    document.querySelectorAll('[data-draw]').forEach(p => {
      try {
        const len = Math.ceil((p as SVGPathElement).getTotalLength());
        (p as SVGPathElement).style.setProperty('--len', String(len));
      } catch (e) {}
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(e => io.observe(e));
    const t = setTimeout(() => els.forEach(e => e.classList.add('in')), 3500);

    const btn = document.querySelector('[data-magnetic]') as HTMLElement | null;
    const inner = document.querySelector('[data-mag-inner]') as HTMLElement | null;
    const icon = document.querySelector('[data-arrowicon]') as HTMLElement | null;
    if (btn && inner) {
      const onMove = (ev: Event) => {
        const e = ev as MouseEvent;
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transition = 'transform .15s ease-out';
        btn.style.transform = `translate(${x}px,${y}px)`;
        inner.style.transform = `translate(${x * 0.4}px,${y * 0.4}px)`;
        if (icon) icon.style.transform = 'rotate(45deg)';
      };
      const onLeave = () => {
        btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
        btn.style.transform = 'translate(0,0)';
        inner.style.transform = 'translate(0,0)';
        if (icon) icon.style.transform = 'rotate(0deg)';
      };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      return () => {
        clearTimeout(t);
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      };
    }
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="ab-root">
        <div className="ab-grain" aria-hidden="true"></div>

        <SharedNav dark={dark} setDark={setDark} />

        {/* OPENING HEADER */}
        <header style={{ position: 'relative', zIndex: 10, padding: 'clamp(70px,15vh,170px) clamp(20px,5vw,60px) clamp(50px,9vh,110px)', textAlign: 'center', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '70vw', height: '70vw', maxWidth: 720, maxHeight: 720, borderRadius: '50%', background: 'radial-gradient(circle at 38% 38%, var(--sig), transparent 56%), radial-gradient(circle at 66% 64%, var(--terra), transparent 56%)', opacity: .15, filter: 'blur(64px)', animation: 'ab-blob 24s ease-in-out infinite', pointerEvents: 'none' }}></div>
          <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 'clamp(120px, 24vh, 260px)', background: 'linear-gradient(to bottom, transparent, var(--bg) 80%)', pointerEvents: 'none' }}></div>
          <div data-reveal style={{ position: 'relative', maxWidth: 940, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 28 }}>
              <span style={{ width: 24, height: 1, background: 'var(--terra)' }}></span>Our story<span style={{ width: 24, height: 1, background: 'var(--terra)' }}></span>
            </div>
            <h1 style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 'clamp(32px,5vw,62px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0, textWrap: 'balance' as 'balance' }}>
              We think good branding shouldn&apos;t belong only to people who can{' '}
              <span className="ab-mark" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--sig)' }}>
                afford it.
                <svg viewBox="0 0 200 16" preserveAspectRatio="none">
                  <path data-draw style={{ '--len': '210' } as React.CSSProperties} d="M4 11 C 50 4, 96 14, 142 7 S 188 5, 196 9" fill="none" stroke="var(--terra)" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 32 }}>MIQSX — built in Pakistan</div>
          </div>
        </header>

        {/* THE STORY */}
        <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(20px,5vw,60px)' }}>
          <div className="ab-col" style={{ position: 'relative' }}>
            {/* Timeline spine */}
            <div className="ab-spine" aria-hidden="true" style={{ position: 'absolute', left: -40, top: 6, bottom: 6, width: 1.5, background: 'var(--line)' }}>
              <span style={{ position: 'absolute', top: 0, left: -4.5, width: 10, height: 10, borderRadius: '50%', background: 'var(--terra)', boxShadow: '0 0 0 4px var(--bg)' }}></span>
              <span style={{ position: 'absolute', top: 0, left: -64, width: 48, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--terra)', lineHeight: 1.2 }}>the itch</span>
              <span style={{ position: 'absolute', top: '50%', left: -4.5, width: 10, height: 10, borderRadius: '50%', background: 'var(--olive)', boxShadow: '0 0 0 4px var(--bg)' }}></span>
              <span style={{ position: 'absolute', top: '50%', left: -64, width: 48, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--olive)', lineHeight: 1.2 }}>the why</span>
              <span style={{ position: 'absolute', bottom: 0, left: -4.5, width: 10, height: 10, borderRadius: '50%', background: 'var(--sig)', boxShadow: '0 0 0 4px var(--bg)' }}></span>
              <span style={{ position: 'absolute', bottom: 0, left: -64, width: 48, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sig)', lineHeight: 1.2 }}>the build</span>
            </div>

            <p className="ab-p ab-drop" data-reveal style={{ fontSize: 'clamp(19px,1.8vw,23px)', color: 'var(--muted)', position: 'relative' }}>
              For two years we kept seeing the same thing. Freelancers and small businesses running entire brands through WhatsApp threads, half-remembered Canva files, and a lot of guesswork.
              <span className="ab-margin" style={{ top: 6 }}>
                where it all started{' '}
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path data-draw style={{ '--len': '44' } as React.CSSProperties} d="M2 6 C 16 2, 30 10, 36 24" stroke="var(--terra)" strokeWidth="2" strokeLinecap="round" />
                  <path data-draw style={{ '--len': '22' } as React.CSSProperties} d="M28 22 L37 26 L38 16" stroke="var(--terra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </p>

            <p className="ab-p" data-reveal>The logo lived on someone&apos;s laptop. The &ldquo;brand colors&rdquo; were whatever felt right that day. Captions got rewritten from scratch every single time, in a different voice, often in the wrong language for the audience. It was inconsistent, it was exhausting, and it quietly made good small businesses look smaller than they were.</p>

            <p className="ab-p" data-reveal style={{ position: 'relative' }}>
              So we looked at the tools people reached for. And we realized something that bothered us: every tool could make <em style={{ fontStyle: 'italic' }}>a logo</em>. You could generate a hundred in an afternoon. But not one of them could actually{' '}
              <em className="ab-mark" style={{ fontStyle: 'italic', color: 'var(--sig)' }}>
                run a brand
                <svg viewBox="0 0 200 16" preserveAspectRatio="none">
                  <path data-draw style={{ '--len': '210' } as React.CSSProperties} d="M3 10 C 48 5, 98 13, 146 7 S 190 6, 197 9" fill="none" stroke="var(--olive)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </em>
              {' '}— hold it together over months, catch a mistake, or remember a single decision you&apos;d already made.
            </p>
          </div>
        </section>

        {/* PULL QUOTE 1 */}
        <div data-reveal style={{ position: 'relative', zIndex: 10, padding: 'clamp(50px,9vh,100px) clamp(20px,5vw,60px)', textAlign: 'center' }}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: 'absolute', left: '16%', top: '30%', animation: 'ab-twinkle 3.6s ease-in-out infinite' }}>
            <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" />
          </svg>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 40 40" fill="var(--olive)" style={{ position: 'absolute', right: '18%', bottom: '28%', animation: 'ab-twinkle 4.2s ease-in-out infinite .8s' }}>
            <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" />
          </svg>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, color: 'var(--terra)', lineHeight: 0, verticalAlign: '-0.2em' }}>&ldquo;</span>
            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 'clamp(30px,4.6vw,58px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '12px 0 0', textWrap: 'balance' as 'balance' }}>
              Every tool could make a logo.{' '}
              <span style={{ display: 'inline-block', position: 'relative', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--sig)', marginTop: 6 }}>
                None could run a brand.
                <svg viewBox="0 0 360 80" preserveAspectRatio="none" style={{ position: 'absolute', left: '-4%', top: '-16%', width: '108%', height: '130%', overflow: 'visible', pointerEvents: 'none' }}>
                  <path data-draw style={{ '--len': '720' } as React.CSSProperties} d="M40 16 C 150 2, 320 6, 348 34 C 360 56, 250 74, 150 72 C 50 70, 6 60, 14 38 C 20 22, 70 12, 130 12" fill="none" stroke="var(--terra)" strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
                </svg>
              </span>
            </p>
          </div>
        </div>

        {/* THE STORY cont. */}
        <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(20px,5vw,60px)' }}>
          <div className="ab-col">
            <p className="ab-p" data-reveal>So we decided not to build another generator. We built a system — one that creates work <em style={{ fontStyle: 'italic' }}>and</em> checks its own work against a brand it actually understands. One that speaks Urdu and English because that&apos;s how our market really talks. And one that learns, so the brand it manages is sharper next month than it is today.</p>
            <p className="ab-p" data-reveal>That&apos;s the part we care about most. A logo is a file. A brand is a living thing — and it should be allowed to grow up.</p>
          </div>
        </section>

        {/* PULL QUOTE 2 */}
        <div data-reveal style={{ position: 'relative', zIndex: 10, padding: 'clamp(40px,8vh,90px) clamp(20px,5vw,60px) clamp(56px,11vh,120px)', textAlign: 'center' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 'clamp(28px,4.2vw,54px)', lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0, textWrap: 'balance' as 'balance' }}>
              A brand isn&apos;t a file you download.{' '}
              <span style={{ display: 'block', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--terra)' }}>It&apos;s something that should get smarter over time.</span>
            </p>
          </div>
        </div>

        {/* THE PEOPLE */}
        <section style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px,4vh,50px) clamp(20px,5vw,60px) clamp(50px,9vh,100px)', borderTop: '1px solid var(--line)' }}>
          <div className="ab-col">
            <div data-reveal style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 10 }}>The people behind it</div>
            <p data-reveal style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px,1.5vw,19px)', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 36px', maxWidth: '52ch' }}>Four final year students who got tired of watching good small brands look accidental. We&apos;re building MIQSX as our degree project — and, quietly, as something bigger.</p>

            <div data-reveal style={{ borderTop: '1px solid var(--line)' }}>
       {[
         { initials: 'QA', bg: 'var(--leaf)', color: '#fff', name: 'Qirrat Azam', role: 'Research & Go-to-market', obsession: 'talking to every freelancer in Karachi.' },
  { initials: 'MF', bg: 'var(--terra)', color: '#fff', name: 'Mahnoor Fatima', role: 'Product & Brand DNA / Design & Frontend', obsession: 'getting the Guardian score to feel fair, and the exact warmth of our cream.' },
  { initials: 'IM', bg: 'var(--sig)', color: 'var(--onSig)', name: 'Iraj Mahmood', role: 'AI & Architecture', obsession: 'Making AI feel smooth.' },
  { initials: 'MS', bg: 'var(--sig)', color: 'var(--onSig)', name: 'Muhammad Sheryar', role: 'AI & System Design', obsession: 'Making the Engine smooth and accurate.' },

].map((m, i) => (
                <div key={i} className="ab-team-row" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 18, alignItems: 'center', padding: '20px 14px', borderBottom: '1px solid var(--line)', borderRadius: 10, transition: 'background .3s ease', margin: '0 -14px' }}>
                  <span style={{ width: 52, height: 52, borderRadius: '50%', background: m.bg, color: m.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: 18 }}>{m.initials}</span>
                  <div className="ab-team-meta">
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px' }}>
                      <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: 19 }}>{m.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{m.role}</span>
                    </div>
                    <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>currently obsessed with — {m.obsession}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY PAKISTAN-FIRST */}
        <section style={{ position: 'relative', zIndex: 10, padding: 'clamp(40px,8vh,90px) clamp(20px,5vw,60px)' }}>
          <div className="ab-col">
            <div data-reveal style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--olive)', marginBottom: 18 }}>Why Pakistan-first</div>
            <p className="ab-p" data-reveal>We didn&apos;t build this for Silicon Valley and then translate it. We built it here, for the way brands actually run here — a home baker taking orders in three languages at once, a freelancer juggling six clients, an agency that can&apos;t afford five separate subscriptions. If it works for them, it works anywhere. Starting anywhere else would have been starting with the wrong assumptions.</p>
            <div data-reveal style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(13px,1.3vw,15px)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--terra)', marginTop: 8 }}>3 languages · 1 source of truth · made in 🇵🇰</div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section data-reveal style={{ position: 'relative', zIndex: 10, padding: 'clamp(56px,11vh,130px) clamp(20px,5vw,60px)', textAlign: 'center', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--sig), transparent 60%)', opacity: .12, filter: 'blur(60px)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 'clamp(30px,4.6vw,60px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 36px', textWrap: 'balance' as 'balance' }}>
              We&apos;re not making logos.{' '}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--sig)' }}>We&apos;re giving brands a brain.</span>
            </h2>
            <Link href="/auth/signup" data-magnetic style={{ position: 'relative', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 14px 14px 28px', borderRadius: 999, background: 'var(--sig)', color: 'var(--onSig)', fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: 18 }}>
              <span data-mag-inner style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                Build your brand
                <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--onSig)', color: 'var(--sig)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg data-arrowicon width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform .35s cubic-bezier(.2,.7,.2,1)' }}>
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </div>
  );
}
