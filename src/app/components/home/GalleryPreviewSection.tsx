import Image from 'next/image';
import { SP } from './Sparkle';
import p6 from '../../../posters/p6.png';
import p8 from '../../../posters/p8.png';
import p9 from '../../../posters/p9.png';
import image1 from '../../../posters/image1.png';
import image2 from '../../../posters/image2.png';
import image3 from '../../../posters/image3.png';
import image4 from '../../../posters/image4.png';
import image5 from '../../../posters/image5.png';
import image6 from '../../../posters/image6.png';
import image7 from '../../../posters/image7.png';
import image8 from '../../../posters/image8.png';
import image9 from '../../../posters/image9.png';

const posters = [image4, p8, image1, image9, p6, image6, image3, p9, image7, image2, image8, image5];

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
              <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '330px', height: '440px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'color-mix(in oklab, var(--on) 16%, transparent)', color: 'var(--on)' }}>98 ✓</span>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 'auto' }}>Logo</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}><svg width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg><span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '33px', fontWeight: 600, letterSpacing: '-0.03em' }}>Saffron</span></div></div>
                <span style={{ fontSize: '13px', color: 'var(--dim)' }}>Primary wordmark · clear-space locked</span>
              </div>
              <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '330px', height: '440px', borderRadius: '20px', background: 'var(--terra)', color: 'var(--terra-on)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.9)', color: 'var(--terra)' }}>100 ✓</span>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7, marginBottom: '20px' }}>Palette</span>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px' }}>
                  <div style={{ borderRadius: '13px', background: 'var(--butter)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--butter-on)', fontSize: '10px', fontWeight: 600 }}>Butter</div>
                  <div style={{ borderRadius: '13px', background: 'var(--olive)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: '#fff', fontSize: '10px', fontWeight: 600 }}>Olive</div>
                  <div style={{ borderRadius: '13px', background: 'var(--peri)', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--peri-on)', fontSize: '10px', fontWeight: 600 }}>Peri</div>
                  <div style={{ borderRadius: '13px', background: '#FBF3EC', display: 'flex', alignItems: 'flex-end', padding: '10px', color: 'var(--terra)', fontSize: '10px', fontWeight: 600 }}>Paper</div>
                </div>
              </div>
              <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '330px', height: '440px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'color-mix(in oklab, var(--on) 16%, transparent)', color: 'var(--on)' }}>99 ✓</span>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>Caption · 3 languages</span>
                <div style={{ borderRadius: '12px', background: 'var(--peri-soft)', color: 'var(--peri-on)', padding: '13px', fontSize: '14px' }}>New collection just dropped 🌙</div>
                <div style={{ borderRadius: '12px', background: 'var(--terra-soft)', color: 'var(--terra)', padding: '13px', fontSize: '15px', direction: 'rtl', textAlign: 'right' }}>نیا کلیکشن آ گیا ہے 🌙</div>
                <div style={{ borderRadius: '12px', background: 'var(--sand)', border: '1px solid var(--line)', padding: '13px', fontSize: '14px', fontStyle: 'italic' }}>Naya collection aa gaya hai 🌙</div>
              </div>
              <div data-tilt style={{ position: 'relative', flex: '0 0 auto', width: '330px', height: '440px', borderRadius: '20px', background: 'var(--butter)', color: 'var(--butter-on)', boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(58,46,14,0.16)' }}>97 ✓</span>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .65, marginBottom: 'auto' }}>Typography</span>
                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '104px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.04em' }}>Aa</div>
                <span style={{ marginTop: 'auto', fontSize: '13px', opacity: .75 }}>Schibsted · Newsreader</span>
              </div>
              {posters.map((poster, i) => (
                <div key={i} data-tilt className="mqsx-poster" style={{ position: 'relative', flex: '0 0 auto', width: '330px', height: '440px', borderRadius: '20px', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}>
                  <Image src={poster} alt={`Poster ${i + 1}`} fill sizes="330px" quality={100} style={{ objectFit: 'cover', objectPosition: i < 2 ? 'center' : 'left top' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
