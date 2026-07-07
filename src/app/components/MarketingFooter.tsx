'use client';
const STAR = <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/>;

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ position: 'relative', zIndex: 10, background: '#1A1510', color: '#F3EEDF', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.1px, transparent 1.1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,7vh,80px) clamp(20px,5vw,60px) 0', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 300 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#F3EEDF', fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 14 }}>
            <span style={{ width: 22, height: 22, background: '#C75D39', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
              <svg width="12" height="12" viewBox="0 0 40 40" fill="#fff">{STAR}</svg>
            </span>MIQSX
          </a>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, lineHeight: 1.6, color: 'rgba(243,238,223,0.68)', margin: 0 }}>The AI Brand Operating System. One Brand DNA — every asset stays on-brand.</p>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(36px,5vw,64px)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'rgba(243,238,223,0.45)' }}>Product</div>
            {[['How it works', '/how-it-works'], ['Features', '/features'], ['Gallery', '/gallery'], ['Pricing', '/pricing']].map(([l,h]) => (
              <a key={h} href={h} style={{ textDecoration: 'none', color: 'rgba(243,238,223,0.8)', fontSize: 14 }}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'rgba(243,238,223,0.45)' }}>Company</div>
            {[['About', '/about'], ['Dashboard', '/dashboard'], ['Sign in', '/auth/login']].map(([l,h]) => (
              <a key={h} href={h} style={{ textDecoration: 'none', color: 'rgba(243,238,223,0.8)', fontSize: 14 }}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'rgba(243,238,223,0.45)' }}>Social</div>
            {[['Instagram', '#'], ['WhatsApp', '#'], ['LinkedIn', '#']].map(([l,h]) => (
              <a key={l} href={h} style={{ textDecoration: 'none', color: 'rgba(243,238,223,0.8)', fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', maxWidth: 1180, margin: 'clamp(34px,5vh,56px) auto 0', padding: '0 clamp(20px,5vw,60px)', overflow: 'hidden' }}>
        <div style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(74px,19vw,252px)', lineHeight: 0.8, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>MIQSX</div>
      </div>
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '22px clamp(20px,5vw,60px) 32px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'rgba(243,238,223,0.55)' }}>© {year} MIQSX — all rights reserved</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(243,238,223,0.8)', padding: '7px 14px', borderRadius: 999, border: '1px dashed rgba(255,255,255,0.25)', transform: 'rotate(-2deg)' }}>
          <svg width="12" height="12" viewBox="0 0 40 40" fill="#C75D39">{STAR}</svg>
          Made in Karachi · DHA Suffa University · 🇵🇰
        </span>
      </div>
    </footer>
  );
}
