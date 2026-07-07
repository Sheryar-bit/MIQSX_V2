'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './marketing-nav.css';

const NAV_LINKS = [
  { label: 'About',        href: '/about' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features',     href: '/features' },
  { label: 'Gallery',      href: '/gallery' },
  { label: 'Pricing',      href: '/#pricing' },
];

const LogoStar = () => (
  <span style={{ width: 22, height: 22, background: 'var(--sig)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, flexShrink: 0 }}>
    <svg width="12" height="12" viewBox="0 0 40 40" fill="var(--onSig)" aria-hidden="true">
      <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" />
    </svg>
  </span>
);

interface Props {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  current?: string;
}

export default function MarketingNav({ dark, setDark, current }: Props) {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const loggedIn = status === 'authenticated';
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      <nav className="mkt-nav">
        <a href="/" className="mkt-logo">
          <LogoStar />MIQSX
        </a>

        <div className="mkt-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className={`mkt-link${current === l.href ? ' active' : ''}`}>
              {current === l.href && <span className="mkt-dot" />}
              {l.label}
            </a>
          ))}
        </div>

        <div className="mkt-right">
          <button onClick={() => setDark(d => !d)} aria-label="Toggle theme" className="mkt-toggle">
            {dark ? 'Dark' : 'Light'}
            <span className="mkt-toggle-icon">{dark ? '☾' : '☀'}</span>
          </button>

          {status === 'loading' ? (
            <span className="mkt-auth-skeleton" />
          ) : loggedIn ? (
            <>
              <a href="/dashboard" className="mkt-cta">Dashboard</a>
              <a href="/profile" className="mkt-avatar" title={session?.user?.name ?? 'Profile'}>
                {initials}
              </a>
            </>
          ) : (
            <>
              <a href="/auth/login" className="mkt-signin">Sign in</a>
              <a href="/auth/signup" className="mkt-cta">Start free</a>
            </>
          )}

          <button
            className={`mkt-burger${open ? ' open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mkt-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <div className={`mkt-drawer${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation">
        <div className="mkt-drawer-head">
          <a href="/" onClick={() => setOpen(false)} className="mkt-logo">
            <LogoStar />MIQSX
          </a>
          <button onClick={() => setOpen(false)} aria-label="Close navigation" className="mkt-close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {NAV_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`mkt-drawer-link${current === l.href ? ' active' : ''}`}
          >
            {l.label}
            <span className="mkt-drawer-arrow">→</span>
          </a>
        ))}

        <div className="mkt-drawer-ctas">
          {loggedIn ? (
            <>
              <a href="/profile" onClick={() => setOpen(false)} className="mkt-drawer-signin">
                {session?.user?.name ?? 'Profile'}
              </a>
              <a href="/dashboard" onClick={() => setOpen(false)} className="mkt-drawer-start">
                Go to Dashboard →
              </a>
            </>
          ) : (
            <>
              <a href="/auth/login" onClick={() => setOpen(false)} className="mkt-drawer-signin">Sign in</a>
              <a href="/auth/signup" onClick={() => setOpen(false)} className="mkt-drawer-start">Start free →</a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
