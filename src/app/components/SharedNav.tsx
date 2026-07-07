'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const SP = () => <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/>;

interface Props {
  dark: boolean;
  setDark: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export default function SharedNav({ dark, setDark }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loggedIn = status === 'authenticated';
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    const nav = document.getElementById('shared-nav') as HTMLElement | null;
    const onScroll = () => {
      if (!nav) return;
      const s = window.scrollY > 30;
      nav.style.background = s ? 'color-mix(in oklab, var(--bg, #F6EFE1) 90%, transparent)' : 'transparent';
      nav.style.backdropFilter = s ? 'blur(16px) saturate(1.3)' : 'none';
      (nav.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = s ? 'blur(16px) saturate(1.3)' : 'none';
      nav.style.boxShadow = s ? '0 8px 30px -14px rgba(33,28,18,0.18)' : 'none';
      nav.style.borderBottomColor = s ? 'var(--border, rgba(33,28,18,0.16))' : 'transparent';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const navLinks = [
    { label: 'About',        href: '/about' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Features',     href: '/features' },
    { label: 'Gallery',      href: '/gallery' },
    { label: 'Pricing',      href: '/pricing' },
  ];

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px clamp(20px, 5vw, 60px)',
    transition: 'background .4s ease, backdrop-filter .4s ease, box-shadow .4s ease',
    borderBottom: '1px solid transparent',
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none', color: 'var(--dim, #6F6857)', fontSize: 15,
    fontWeight: 500, padding: '8px 14px', borderRadius: 9,
  };

  return (
    <>
      <nav id="shared-nav" style={navStyle}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink, #211C12)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 23, letterSpacing: '-0.02em' }}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="var(--terra, #C75D39)" aria-hidden="true"><SP /></svg>
          MIQSX
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="snav-links">
          {navLinks.map(l => {
            const active = pathname === l.href;
            return (
              <a key={l.href} href={l.href} style={{ ...linkStyle, color: active ? 'var(--ink, #211C12)' : 'var(--dim, #6F6857)', fontWeight: active ? 600 : 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terra, #C75D39)', flexShrink: 0, display: 'inline-block' }} />}
                {l.label}
              </a>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <button
            onClick={() => setDark(d => !d)}
            aria-label="Toggle theme"
            style={{ position: 'relative', width: 54, height: 29, borderRadius: 999, border: '1px solid var(--border, rgba(33,28,18,0.16))', background: 'var(--sand, #EDE4D3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            className="snav-toggle"
          >
            <span style={{ position: 'absolute', left: 8, fontSize: 11, opacity: .7 }}>☀</span>
            <span style={{ position: 'absolute', right: 8, fontSize: 10, opacity: .7 }}>☾</span>
            <span style={{ position: 'absolute', top: 3, left: dark ? 28 : 3, width: 23, height: 23, borderRadius: '50%', background: 'var(--ink, #211C12)', transition: 'left .4s cubic-bezier(.6,0,.2,1)' }} />
          </button>

          {status === 'loading' ? (
            <span style={{ display: 'inline-block', width: 80, height: 36, borderRadius: 999, background: 'var(--line, rgba(33,28,18,0.11))', opacity: 0.5 }} />
          ) : loggedIn ? (
            <>
              <a href="/dashboard" style={{ textDecoration: 'none', color: 'var(--paper, #F6EFE1)', fontSize: 15, fontWeight: 600, padding: '11px 22px', borderRadius: 999, background: 'var(--ink, #211C12)', whiteSpace: 'nowrap' }} className="snav-cta">Dashboard</a>
              <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--sig, #2F5A48)', color: 'var(--onSig, #fff)', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }} title="Profile">
                {initials}
              </a>
            </>
          ) : (
            <a href="/auth/signup" style={{ textDecoration: 'none', color: 'var(--paper, #F6EFE1)', fontSize: 15, fontWeight: 600, padding: '11px 22px', borderRadius: 999, background: 'var(--ink, #211C12)', whiteSpace: 'nowrap' }} className="snav-cta">Start free</a>
          )}

          <button
            className={`snav-burger${open ? ' open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`snav-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <div className={`snav-drawer${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <a href="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink, #211C12)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="var(--terra, #C75D39)" aria-hidden="true"><SP /></svg>MIQSX
          </a>
          <button onClick={() => setOpen(false)} aria-label="Close" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border, rgba(33,28,18,0.16))', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink, #211C12)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {navLinks.map(l => {
          const active = pathname === l.href;
          return (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: active ? 'var(--terra, #C75D39)' : 'var(--ink, #211C12)', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 21, letterSpacing: '-0.02em', padding: '14px 0', borderBottom: '1px solid var(--line, rgba(33,28,18,0.11))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--terra, #C75D39)', display: 'inline-block', flexShrink: 0 }} />}
                {l.label}
              </span>
              <span style={{ color: 'var(--terra, #C75D39)', fontSize: 16 }}>→</span>
            </a>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loggedIn ? (
            <>
              <a href="/profile" onClick={() => setOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--dim, #6F6857)', fontSize: 15, fontWeight: 600, padding: 13, borderRadius: 999, border: '1px solid var(--border, rgba(33,28,18,0.16))' }}>{session?.user?.name ?? 'Profile'}</a>
              <a href="/dashboard" onClick={() => setOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--paper, #F6EFE1)', background: 'var(--ink, #211C12)', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 999 }}>Dashboard →</a>
            </>
          ) : (
            <>
              <a href="/auth/login" onClick={() => setOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--dim, #6F6857)', fontSize: 15, fontWeight: 600, padding: 13, borderRadius: 999, border: '1px solid var(--border, rgba(33,28,18,0.16))' }}>Sign in</a>
              <a href="/auth/signup" onClick={() => setOpen(false)} style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--paper, #F6EFE1)', background: 'var(--ink, #211C12)', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 999 }}>Start free →</a>
            </>
          )}
        </div>
      </div>

      <style>{`
        .snav-links { display: flex; }
        .snav-burger { display: none; flex-direction: column; align-items: center; justify-content: center; gap: 5px; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border, rgba(33,28,18,0.16)); background: transparent; cursor: pointer; padding: 0; flex-shrink: 0; }
        .snav-burger span { display: block; width: 18px; height: 1.5px; background: var(--ink, #211C12); border-radius: 999px; transform-origin: center; transition: transform .32s cubic-bezier(.6,0,.2,1), opacity .25s ease; }
        .snav-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .snav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .snav-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
        .snav-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(43,37,32,0.5); backdrop-filter: blur(6px); opacity: 0; pointer-events: none; transition: opacity .35s ease; }
        .snav-overlay.open { opacity: 1; pointer-events: auto; }
        .snav-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(300px,85vw); z-index: 210; background: var(--bg, #F6EFE1); border-left: 1px solid var(--line, rgba(33,28,18,0.11)); padding: 24px 22px 32px; display: flex; flex-direction: column; transform: translateX(100%); visibility: hidden; transition: transform .4s cubic-bezier(.3,.7,.2,1), visibility 0s linear .4s; overflow-y: auto; }
        .snav-drawer.open { transform: translateX(0); visibility: visible; transition: transform .4s cubic-bezier(.3,.7,.2,1), visibility 0s linear 0s; }
        @media (max-width: 740px) { .snav-links { display: none; } .snav-toggle { display: none; } .snav-cta { display: none; } .snav-burger { display: flex; } }
      `}</style>
    </>
  );
}
