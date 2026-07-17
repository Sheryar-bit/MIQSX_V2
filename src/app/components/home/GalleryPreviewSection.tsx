import Image from 'next/image';
import { SP } from './Sparkle';
import p1 from '../../../posters/p1.png';
import p2 from '../../../posters/p2.png';
import p3 from '../../../posters/p3.png';
import p4 from '../../../posters/p4.png';
import p5 from '../../../posters/p5.png';
import p6 from '../../../posters/p6.png';
import p7 from '../../../posters/p7.png';
import p8 from '../../../posters/p8.png';
import p9 from '../../../posters/p9.png';

const posters = [p1, p2, p3, p4, p5, p6, p7, p8, p9];

export default function GalleryPreviewSection() {
  return (
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
              {posters.map((poster, i) => (
                <div key={i} data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '290px', height: '366px', borderRadius: '20px', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <Image src={poster} alt={`Poster ${i + 1}`} fill sizes="290px" quality={100} style={{ objectFit: 'cover', objectPosition: i < 2 ? 'center' : 'left top' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
