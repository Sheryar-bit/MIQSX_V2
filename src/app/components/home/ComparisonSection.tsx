import { SP } from './Sparkle';

export default function ComparisonSection() {
  return (
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
  );
}
