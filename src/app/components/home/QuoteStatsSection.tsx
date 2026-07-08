import { SP } from './Sparkle';

export default function QuoteStatsSection() {
  return (
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
  );
}
