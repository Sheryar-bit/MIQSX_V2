import { SP } from './Sparkle';

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto' }}>
      <div style={{ maxWidth: '780px', marginBottom: 'clamp(40px, 6vh, 64px)' }}>
        <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> Features</div>
        <h2 data-reveal data-reveal-delay="60" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(31px, 4.8vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>Generation is easy. <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500, color: 'var(--terra)' }}>Judgment</span> isn&apos;t.</h2>
        <p data-reveal data-reveal-delay="120" style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(17px, 1.9vw, 20px)', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '56ch' }}>Anyone can spin up a logo now. MIQSX is the part that decides whether it belongs to your brand and keeps it that way at scale.</p>
      </div>

      {/* Showcase A */}
      <div data-reveal className="mqsx-show" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)' }}>01</span>
            <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>The foundation</span>
          </div>
          <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.04, margin: '0 0 14px' }}>Brand DNA Engine</h3>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 20px', maxWidth: '44ch' }}>One living source of truth voice, palette, type, audience, do&apos;s and don&apos;ts. Every other feature reads from it, so consistency isn&apos;t a checklist; it&apos;s simply the default.</p>
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
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '14px', color: 'var(--dim)', marginBottom: '16px' }}>Voice warm, direct, a little playful.</div>
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
          <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Scores every asset against your DNA and tells you exactly what&apos;s off before it ships.</p>
        </div>
        <div data-reveal data-reveal-delay="90" className="trio-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'var(--peri-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--peri-on)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18v12H7l-4 4z"/><path d="M7 9h10M7 13h6"/></svg></span>
            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--peri-on)' }}>EN·<span style={{ fontFamily: "'Newsreader', serif" }}>اردو</span></span>
          </div>
          <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' }}>Trilingual captions</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>English, Urdu and Roman Urdu not translated, actually written natively for each.</p>
        </div>
        <div data-reveal data-reveal-delay="180" className="trio-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'var(--butter-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--butter-on)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 19c0-2 .8-3.4 2.3-4"/></svg></span>
            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '17px', color: 'var(--butter-on)' }}>×12</span>
          </div>
          <h3 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' }}>AI Focus Group</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>Test concepts on synthetic personas that sound like your real audience before ad spend.</p>
        </div>
      </div>

      {/* Showcase B: WhatsApp */}
      <div data-reveal className="mqsx-show rev" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
        <div style={{ position: 'relative', borderRadius: '24px', background: 'var(--olive-deep)', padding: 'clamp(26px, 3vw, 40px)', overflow: 'hidden', minHeight: '290px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '11px', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
            <div style={{ alignSelf: 'flex-end', maxWidth: '86%', background: '#25D366', color: '#062b14', padding: '12px 15px', borderRadius: '15px 15px 4px 15px', fontSize: '14px', fontWeight: 500 }}>Eid campaign 3 posts ready for review 🌙</div>
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
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 20px', maxWidth: '44ch' }}>Reviews happen where your clients already are. Send for approval, get a yes, and the brand learns from every decision no portals, no chasing.</p>
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
  );
}
