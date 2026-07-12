import { SP } from './Sparkle';

export default function HowItWorksSection() {
  return (
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
  );
}
