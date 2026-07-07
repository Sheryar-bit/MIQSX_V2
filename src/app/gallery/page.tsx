'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './gallery.css';
import SharedNav from '../components/SharedNav';
import MarketingFooter from '../components/MarketingFooter';

const BRANDS: Record<string, { swatches: string[]; font: string; tone: string[] }> = {
  'Saha Bakery':  { swatches: ['#6F4A2E','#C26B43','#E8C27E','#F4EEE2'], font: 'Saha', tone: ['warm','homemade','trusted'] },
  'Zara Threads': { swatches: ['#2B2520','#8A8A4C','#C9C2A6','#F4EEE2'], font: 'Zara', tone: ['minimal','refined','quiet'] },
  'Chai Co.':     { swatches: ['#1E5A40','#3C8C5A','#D9B25A','#EFE7D6'], font: 'Chai', tone: ['cosy','desi','fresh'] },
  'Nuxe Tech':    { swatches: ['#2B59C3','#46B07A','#15110C','#E6ECFF'], font: 'Nuxe', tone: ['bold','modern','sharp'] },
};

function grad(a: string, b: string) { return `linear-gradient(150deg, ${a}, ${b})`; }
function score(n: number) { return { score: `${n}${n >= 90 ? ' ✓' : ' ✗'}`, scoreBg: n >= 90 ? 'var(--leaf)' : 'var(--red)' }; }

type Card = { id: number; brand: string; type: string; style: string; kind: string; bg?: string; logoColor?: string; logoSize?: number; h: number; word?: string; swatches?: string[][]; en?: string; ur?: string; roman?: string; score: string; scoreBg: string; };

const ALL_CARDS: Card[] = [
  { brand:'Saha Bakery',  type:'Logos',        style:'Vintage',    kind:'logo',    word:'Saha',                       bg:grad('#6F4A2E','#C26B43'),    logoColor:'#F4EEE2', logoSize:52, h:150, ...score(98) },
  { brand:'Saha Bakery',  type:'Posts',         style:'Watercolor', kind:'post',    word:'Fresh for Eid 🌙',           bg:grad('#C26B43','#E8C27E'),                         h:230, ...score(96) },
  { brand:'Saha Bakery',  type:'Palettes',      style:'Vintage',    kind:'palette', swatches:[['#6F4A2E','#fff'],['#C26B43','#fff'],['#E8C27E','#3a2a18'],['#F4EEE2','#6F665A']], h:190, ...score(99) },
  { brand:'Saha Bakery',  type:'Captions',      style:'Vintage',    kind:'caption', en:'New collection 🌙',            ur:'نیا کلیکشن',               roman:'Naya collection', h:150, ...score(97) },
  { brand:'Zara Threads', type:'Logos',         style:'Minimalist', kind:'logo',    word:'Zara',                       bg:'var(--surf2)',               logoColor:'#2B2520', logoSize:50, h:130, ...score(95) },
  { brand:'Zara Threads', type:'Posts',         style:'Minimalist', kind:'post',    word:'Quiet luxury, every thread', bg:grad('#8A8A4C','#C9C2A6'),                         h:250, ...score(94) },
  { brand:'Zara Threads', type:'Style frames',  style:'Minimalist', kind:'frame',   word:'Editorial · Lookbook',       bg:'#2B2520',                   logoColor:'#C9C2A6', h:170, ...score(92) },
  { brand:'Zara Threads', type:'Palettes',      style:'Flat',       kind:'palette', swatches:[['#2B2520','#fff'],['#8A8A4C','#fff'],['#C9C2A6','#2B2520'],['#F4EEE2','#6F665A']], h:200, ...score(96) },
  { brand:'Chai Co.',     type:'Logos',         style:'Flat',       kind:'logo',    word:'Chai',                       bg:grad('#1E5A40','#3C8C5A'),    logoColor:'#EFE7D6', logoSize:50, h:140, ...score(97) },
  { brand:'Chai Co.',     type:'Posts',         style:'Flat',       kind:'post',    word:'Karak season is here',       bg:grad('#3C8C5A','#D9B25A'),                         h:220, ...score(93) },
  { brand:'Chai Co.',     type:'Captions',      style:'Watercolor', kind:'caption', en:'One more cup? ☕',             ur:'ایک اور کپ؟',              roman:'Ik aur cup?',  h:150, ...score(95) },
  { brand:'Chai Co.',     type:'Style frames',  style:'3D',         kind:'frame',   word:'Steam · Warmth · Cosy',      bg:grad('#1E5A40','#0e3a28'),    logoColor:'#D9B25A', h:180, ...score(58) },
  { brand:'Nuxe Tech',    type:'Logos',         style:'Neon',       kind:'logo',    word:'Nuxe',                       bg:grad('#2B59C3','#15110C'),    logoColor:'#7FB0FF', logoSize:52, h:150, ...score(96) },
  { brand:'Nuxe Tech',    type:'Posts',         style:'Neon',       kind:'post',    word:'Ship faster. Stay sharp.',   bg:grad('#2B59C3','#46B07A'),                         h:240, ...score(91) },
  { brand:'Nuxe Tech',    type:'Palettes',      style:'3D',         kind:'palette', swatches:[['#2B59C3','#fff'],['#46B07A','#fff'],['#15110C','#7FB0FF'],['#E6ECFF','#2B59C3']], h:185, ...score(97) },
  { brand:'Nuxe Tech',    type:'Captions',      style:'Neon',       kind:'caption', en:'Built for scale ⚡',           ur:'بڑے پیمانے کے لیے',       roman:'Baray paimanay ke liye', h:150, ...score(54) },
].map((c, i) => ({ ...c, id: i }));

function buildCanvas(brand: string) {
  const info = BRANDS[brand];
  const assets = ALL_CARDS.filter(c => c.brand === brand);
  const bw = 1700, bh = 1150, cx = bw / 2, cy = bh / 2;
  const dnaW = 250, aw = 168;
  const links: { x1:number; y1:number; x2:number; y2:number }[] = [];
  const n = assets.length;
  const nodes = assets.map((c, i) => {
    const ang = (-90 + i * (360 / n)) * Math.PI / 180;
    const ax = cx + Math.cos(ang) * 540;
    const ay = cy + Math.sin(ang) * 380;
    const ah = 116;
    links.push({ x1: cx, y1: cy, x2: ax, y2: ay });
    const isCap = c.kind === 'caption';
    return {
      left: Math.round(ax - aw / 2), top: Math.round(ay - (ah + 34) / 2), w: aw, h: ah,
      bg: c.kind === 'palette' ? `linear-gradient(135deg, ${(c.swatches||[]).map(s => s[0]).join(',')})` : (c.bg || 'var(--surf2)'),
      label: isCap ? (c.en || '') : (c.word || c.type),
      font: c.kind === 'logo' ? "'Instrument Serif', serif" : "'General Sans', sans-serif",
      fstyle: c.kind === 'logo' ? 'italic' : 'normal',
      fsize: c.kind === 'logo' ? 30 : 15,
      fc: c.logoColor || '#fff',
      kind: c.type, score: c.score, scoreBg: c.scoreBg,
    };
  });
  return { bw, bh, links, assets: nodes, dna: { swatches: info.swatches, font: info.font, tone: info.tone }, brand, dnaLeft: cx - dnaW / 2, dnaTop: cy - dnaW / 2, dnaW };
}

type Chip = { label: string; active: boolean };
const TYPE_CHIPS = ['All','Logos','Posts','Palettes','Captions','Style frames'];
const STYLE_CHIPS = ['All','Minimalist','Vintage','Neon','Flat','3D','Watercolor'];
const BRAND_CHIPS = ['All','Saha Bakery','Zara Threads','Chai Co.','Nuxe Tech'];

export default function GalleryPage() {
  const [dark, setDark] = useState(false);
  const [fType, setFType] = useState('All');
  const [fStyle, setFStyle] = useState('All');
  const [fBrand, setFBrand] = useState('All');
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const theme = dark ? 'dark' : 'light';

  const vpRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef({ x: 0, y: 0, s: 0.66 });
  const teardownRef = useRef<(() => void) | null>(null);

  const cards = ALL_CARDS.filter(c =>
    (fType === 'All' || c.type === fType) &&
    (fStyle === 'All' || c.style === fStyle) &&
    (fBrand === 'All' || c.brand === fBrand)
  );

  const applyBoard = useCallback(() => {
    const board = boardRef.current;
    if (board && viewRef.current) {
      const { x, y, s } = viewRef.current;
      board.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    }
  }, []);

  const centerBoard = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const r = vp.getBoundingClientRect();
    const small = r.width < 740;
    const s = small ? 0.42 : 0.66;
    viewRef.current = { x: r.width / 2 - 850 * s, y: r.height / 2 - 575 * s, s };
    applyBoard();
  }, [applyBoard]);

  const initBoard = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    centerBoard();
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const down = (e: PointerEvent) => {
      dragging = true; vp.classList.add('grabbing');
      sx = e.clientX; sy = e.clientY; ox = viewRef.current.x; oy = viewRef.current.y;
      vp.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      viewRef.current.x = ox + (e.clientX - sx);
      viewRef.current.y = oy + (e.clientY - sy);
      applyBoard();
    };
    const up = () => { dragging = false; vp.classList.remove('grabbing'); };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const ns = Math.max(0.3, Math.min(2, viewRef.current.s * (1 - e.deltaY * 0.0015)));
      viewRef.current.x = mx - (mx - viewRef.current.x) * (ns / viewRef.current.s);
      viewRef.current.y = my - (my - viewRef.current.y) * (ns / viewRef.current.s);
      viewRef.current.s = ns; applyBoard();
    };
    vp.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move as EventListener);
    window.addEventListener('pointerup', up);
    vp.addEventListener('wheel', wheel, { passive: false });
    teardownRef.current = () => {
      vp.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move as EventListener);
      window.removeEventListener('pointerup', up);
      vp.removeEventListener('wheel', wheel);
    };
  }, [applyBoard, centerBoard]);

  // canvas open/close
  useEffect(() => {
    if (!openBrand) {
      if (teardownRef.current) { teardownRef.current(); teardownRef.current = null; }
      return;
    }
    let tries = 0;
    const poll = () => {
      if (vpRef.current && boardRef.current) { initBoard(); return; }
      if (tries++ < 60) setTimeout(poll, 16);
    };
    const t = setTimeout(poll, 16);
    return () => clearTimeout(t);
  }, [openBrand, initBoard]);

  // ESC to close canvas
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenBrand(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // scroll reveal + tilt + magnetic CTA + data-draw
  useEffect(() => {
    document.querySelectorAll('[data-draw]').forEach(p => {
      try { const len = Math.ceil((p as SVGGeometryElement).getTotalLength()); (p as HTMLElement).style.setProperty('--len', String(len)); } catch(_) {}
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); }
    else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en, i) => { if (en.isIntersecting) { setTimeout(() => en.target.classList.add('in'), Math.min(i * 50, 300)); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(e => io.observe(e));
      setTimeout(() => document.querySelectorAll('[data-reveal]:not(.in)').forEach(e => e.classList.add('in')), 3500);
    }

    if (!reduce) {
      const wall = document.querySelector('[data-masonry]');
      if (wall) {
        wall.addEventListener('pointermove', (e: Event) => {
          const pe = e as PointerEvent;
          const card = (pe.target as Element).closest<HTMLElement>('[data-tilt]');
          if (!card) return;
          const inner = card.querySelector<HTMLElement>('.gl-card-inner');
          if (!inner) return;
          const r = card.getBoundingClientRect();
          const px = (pe.clientX - r.left) / r.width - 0.5;
          const py = (pe.clientY - r.top) / r.height - 0.5;
          inner.style.transform = `perspective(800px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
        });
        wall.addEventListener('pointerout', (e: Event) => {
          const card = (e.target as Element).closest<HTMLElement>('[data-tilt]');
          if (!card) return;
          const inner = card.querySelector<HTMLElement>('.gl-card-inner');
          if (inner) inner.style.transform = '';
        });
      }

      const btn = document.querySelector<HTMLElement>('[data-magnetic]');
      const magInner = document.querySelector<HTMLElement>('[data-mag-inner]');
      const icon = document.querySelector<HTMLElement>('[data-arrowicon]');
      if (btn && magInner) {
        btn.addEventListener('mousemove', (ev) => {
          const r = btn.getBoundingClientRect();
          const x = (ev.clientX - r.left - r.width / 2) * 0.25;
          const y = (ev.clientY - r.top - r.height / 2) * 0.35;
          btn.style.transition = 'transform .15s ease-out';
          btn.style.transform = `translate(${x}px,${y}px)`;
          magInner.style.transform = `translate(${x * 0.4}px,${y * 0.4}px)`;
          if (icon) icon.style.transform = 'rotate(45deg)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
          btn.style.transform = 'translate(0,0)';
          magInner.style.transform = 'translate(0,0)';
          if (icon) icon.style.transform = 'rotate(0deg)';
        });
      }
    }
  }, []);

  // re-reveal newly visible cards after filter change
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(e => e.classList.add('in'));
    }, 50);
  }, [fType, fStyle, fBrand]);

  const logoStar = <svg viewBox="0 0 40 40" fill="var(--onSig)" width="12" height="12"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>;
  const canvas = openBrand ? buildCanvas(openBrand) : null;

  function ChipRow({ label, chips, active, onSelect }: { label: string; chips: string[]; active: string; onSelect: (v: string) => void }) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'9px', overflowX:'auto', paddingBottom:'2px', scrollbarWidth:'none' as React.CSSProperties['scrollbarWidth'] }}>
        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted)', flex:'0 0 auto', width:'42px' }}>{label}</span>
        {chips.map(c => (
          <button key={c} className="gl-chip" onClick={() => onSelect(c)} style={{ flex:'0 0 auto', background: active===c ? 'var(--sig)' : 'var(--surface)', color: active===c ? 'var(--onSig)' : 'var(--muted)', borderColor: active===c ? 'var(--sig)' : 'var(--line)' }}>{c}</button>
        ))}
      </div>
    );
  }

  function CardVisual({ card }: { card: Card }) {
    if (card.kind === 'logo') return (
      <div style={{ height:`${card.h}px`, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:`${card.logoSize}px`, color:card.logoColor }}>{card.word}</span>
      </div>
    );
    if (card.kind === 'post') return (
      <div style={{ height:`${card.h}px`, background:card.bg, position:'relative', display:'flex', alignItems:'flex-end', padding:'16px' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 72% 26%, rgba(255,255,255,.26), transparent 52%)' }} />
        <span style={{ position:'relative', fontFamily:"'General Sans'", fontWeight:600, fontSize:'22px', lineHeight:1.05, color:'#fff', letterSpacing:'-0.01em' }}>{card.word}</span>
      </div>
    );
    if (card.kind === 'palette') return (
      <div style={{ height:`${card.h}px`, background:'var(--surf2)', display:'flex', flexDirection:'column' }}>
        {(card.swatches||[]).map(([c,t],i) => (
          <div key={i} style={{ flex:1, background:c, display:'flex', alignItems:'flex-end', padding:'6px 12px' }}>
            <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:t }}>{c.toUpperCase()}</span>
          </div>
        ))}
      </div>
    );
    if (card.kind === 'caption') return (
      <div style={{ height:`${card.h}px`, background:'var(--surface)', padding:'18px', display:'flex', flexDirection:'column', gap:'9px', justifyContent:'center' }}>
        <span style={{ fontSize:'15px', color:'var(--ink)' }}>{card.en}</span>
        <span style={{ direction:'rtl', textAlign:'right', fontFamily:"'Newsreader', serif", fontSize:'17px', color:'var(--ink)' }}>{card.ur}</span>
        <span style={{ fontStyle:'italic', fontSize:'13px', color:'var(--muted)' }}>{card.roman}</span>
      </div>
    );
    return (
      <div style={{ height:`${card.h}px`, background:card.bg, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.14em', textTransform:'uppercase', color:card.logoColor, opacity:.9 }}>{card.word}</span>
      </div>
    );
  }

  return (
    <div data-theme={theme} style={{ minHeight:'100vh' }}>
      <div data-root style={{ position:'relative', background:'var(--bg)', color:'var(--ink)', fontFamily:"'General Sans', system-ui, sans-serif", minHeight:'100vh', overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>
        <div className="gl-grain" aria-hidden="true" />

        <SharedNav dark={dark} setDark={setDark} />

        {/* HEADER */}
        <header style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(48px, 10vh, 110px) clamp(20px, 5vw, 60px) clamp(28px, 5vh, 52px)' }}>
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', right:'9%', top:'26%', animation:'gl-twinkle 3.4s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <svg aria-hidden="true" width="17" height="17" viewBox="0 0 40 40" fill="var(--olive)" style={{ position:'absolute', right:'16%', top:'44%', animation:'gl-twinkle 4.1s ease-in-out infinite .7s' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <div data-reveal style={{ display:'inline-flex', alignItems:'center', gap:'10px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'22px' }}><span style={{ width:'24px', height:'1px', background:'var(--terra)' }} />Gallery</div>
          <h1 className="gl-head" data-reveal style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(40px, 6vw, 82px)', lineHeight:0.98, letterSpacing:'-0.035em', margin:0, maxWidth:'16ch' }}>
            Every asset,{' '}
            <span style={{ position:'relative', display:'inline-block', fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>
              one identity.
              <svg viewBox="0 0 240 16" preserveAspectRatio="none" style={{ position:'absolute', left:'-2%', bottom:'-0.12em', width:'104%', height:'0.34em', overflow:'visible', pointerEvents:'none' }}>
                <path data-draw style={{ '--len':'250' } as React.CSSProperties} d="M4 10 C 60 3, 120 14, 178 7 S 232 5, 236 9" fill="none" stroke="var(--terra)" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p data-reveal style={{ fontFamily:"'Newsreader', serif", fontSize:'clamp(17px, 1.7vw, 20px)', lineHeight:1.6, color:'var(--muted)', maxWidth:'52ch', margin:'22px 0 0' }}>Real brands built in MIQSX — every piece tagged, scored, and connected back to its DNA. Tap any card to open its whole brand world.</p>
        </header>

        {/* FILTER BAR */}
        <div data-reveal style={{ position:'sticky', top:'65px', zIndex:60, background:'color-mix(in oklab, var(--bg) 90%, transparent)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
          <div style={{ maxWidth:'1240px', margin:'0 auto', padding:'14px clamp(20px, 5vw, 60px)', display:'flex', flexDirection:'column', gap:'11px' }}>
            <ChipRow label="Type"  chips={TYPE_CHIPS}  active={fType}  onSelect={setFType} />
            <ChipRow label="Style" chips={STYLE_CHIPS} active={fStyle} onSelect={setFStyle} />
            <ChipRow label="Brand" chips={BRAND_CHIPS} active={fBrand} onSelect={setFBrand} />
          </div>
        </div>

        {/* MASONRY WALL */}
        <section style={{ position:'relative', zIndex:10, maxWidth:'1240px', margin:'0 auto', padding:'clamp(22px, 4vh, 40px) clamp(20px, 5vw, 60px) clamp(40px, 8vh, 90px)' }}>
          <div data-reveal style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'clamp(20px, 3vh, 32px)', flexWrap:'wrap' }}>
            <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'clamp(18px, 1.9vw, 23px)', color:'var(--terra)' }}>psst — every card is graded &amp; clickable</span>
            <svg aria-hidden="true" width="92" height="40" viewBox="0 0 92 40" fill="none" style={{ overflow:'visible' }}>
              <path data-draw style={{ '--len':'96' } as React.CSSProperties} d="M4 8 C 34 2, 64 10, 80 30" stroke="var(--terra)" strokeWidth="2.4" strokeLinecap="round"/>
              <path data-draw style={{ '--len':'34' } as React.CSSProperties} d="M68 28 L82 33 L84 18" stroke="var(--terra)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.08em', color:'var(--muted)', padding:'6px 12px', border:'1px dashed var(--line)', borderRadius:'999px' }}>tap → open the brand world</span>
          </div>

          <div data-masonry className="gl-masonry">
            {cards.map(card => (
              <div key={card.id} className="gl-card" data-tilt data-reveal role="button" tabIndex={0} aria-label={`${card.brand} ${card.type} — open brand world`}
                onClick={() => setOpenBrand(card.brand)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenBrand(card.brand); } }}>
                <div className="gl-card-inner">
                  <CardVisual card={card} />
                  <span style={{ position:'absolute', top:'10px', left:'10px', fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.04em', padding:'5px 9px', borderRadius:'999px', background:'rgba(20,16,11,.55)', color:'#fff', backdropFilter:'blur(4px)' }}>{card.brand}</span>
                  <span className="gl-score" style={{ position:'absolute', bottom:'10px', right:'10px', fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'11px', padding:'5px 9px', borderRadius:'999px', background:card.scoreBg, color:'#fff' }}>{card.score}</span>
                </div>
              </div>
            ))}
          </div>

          {cards.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', fontFamily:"'Newsreader', serif", fontStyle:'italic', fontSize:'19px', color:'var(--muted)' }}>Nothing matches those filters yet — try another combination.</div>
          )}
        </section>

        {/* CLOSING CTA */}
        <section data-reveal style={{ position:'relative', zIndex:10, padding:'clamp(48px, 10vh, 120px) clamp(20px, 5vw, 60px)', textAlign:'center', overflow:'hidden' }}>
          <div aria-hidden="true" style={{ position:'absolute', bottom:'-34%', left:'50%', transform:'translateX(-50%)', width:'60vw', height:'60vw', maxWidth:'620px', maxHeight:'620px', borderRadius:'50%', background:'radial-gradient(circle, var(--sig), transparent 60%)', opacity:.12, filter:'blur(60px)', pointerEvents:'none' }} />
          <div style={{ position:'relative', maxWidth:'900px', margin:'0 auto' }}>
            <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(30px, 4.6vw, 60px)', lineHeight:1.06, letterSpacing:'-0.03em', margin:'0 0 32px', textWrap:'balance' } as React.CSSProperties}>Your brand could <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--terra)' }}>live here too.</span></h2>
            <a href="/auth/signup" data-magnetic style={{ position:'relative', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'14px', padding:'14px 14px 14px 28px', borderRadius:'999px', background:'var(--sig)', color:'var(--onSig)', fontFamily:"'General Sans'", fontWeight:600, fontSize:'18px' }}>
              <span data-mag-inner style={{ display:'inline-flex', alignItems:'center', gap:'14px' }}>
                Build your brand
                <span style={{ width:'42px', height:'42px', borderRadius:'50%', background:'var(--onSig)', color:'var(--sig)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                  <svg data-arrowicon width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'transform .35s cubic-bezier(.2,.7,.2,1)' }}><path d="M7 17 17 7M9 7h8v8"/></svg>
                </span>
              </span>
            </a>
          </div>
        </section>

        <MarketingFooter />

        {/* BRAND WORLD CANVAS OVERLAY */}
        {openBrand && canvas && (
          <div data-overlay style={{ position:'fixed', inset:0, zIndex:200, background:'color-mix(in oklab, var(--bg) 60%, #000)', backdropFilter:'blur(3px)' }}>
            <div ref={vpRef} data-vp style={{ position:'absolute', inset:0, overflow:'hidden' }}>
              <div ref={boardRef} data-board style={{ position:'absolute', top:0, left:0, width:`${canvas.bw}px`, height:`${canvas.bh}px`, transformOrigin:'0 0', backgroundImage:'radial-gradient(var(--line) 1px, transparent 1px)', backgroundSize:'40px 40px' }}>
                <svg width={canvas.bw} height={canvas.bh} style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }} aria-hidden="true">
                  {canvas.links.map((l, i) => (
                    <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--terra)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5" style={{ animation:'gl-dash 1s linear infinite' }} />
                  ))}
                </svg>
                {/* DNA node */}
                <div style={{ position:'absolute', left:`${canvas.dnaLeft}px`, top:`${canvas.dnaTop}px`, width:`${canvas.dnaW}px`, borderRadius:'20px', background:'var(--surface)', border:'2px solid var(--sig)', boxShadow:'0 26px 60px -28px rgba(0,0,0,.6)', padding:'20px', zIndex:5 }}>
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', top:'-13px', left:'-13px', animation:'gl-twinkle 3s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
                  <span style={{ position:'absolute', top:'-14px', right:'14px', fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'14px', color:'var(--terra)', background:'var(--bg)', padding:'0 7px' }}>the source</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'14px' }}>
                    <span style={{ width:'26px', height:'26px', borderRadius:'8px', background:'var(--sig)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{logoStar}</span>
                    <div>
                      <div style={{ fontFamily:"'General Sans'", fontWeight:700, fontSize:'17px', lineHeight:1 }}>{canvas.brand}</div>
                      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted)', marginTop:'3px' }}>Brand DNA</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                    {canvas.dna.swatches.map((s, i) => <span key={i} style={{ flex:1, height:'30px', borderRadius:'7px', background:s }} />)}
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'8px', borderTop:'1px solid var(--line)', paddingTop:'12px', marginBottom:'10px' }}>
                    <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'24px' }}>{canvas.dna.font}</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {canvas.dna.tone.map((t, i) => <span key={i} style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', padding:'4px 9px', borderRadius:'999px', background:'var(--surf2)', color:'var(--muted)' }}>{t}</span>)}
                  </div>
                </div>
                {/* Asset nodes */}
                {canvas.assets.map((a, i) => (
                  <div key={i} style={{ position:'absolute', left:`${a.left}px`, top:`${a.top}px`, width:`${a.w}px`, zIndex:6 }}>
                    <div style={{ borderRadius:'14px', overflow:'hidden', border:'1px solid var(--line)', background:'var(--surface)', boxShadow:'0 18px 44px -26px rgba(0,0,0,.55)' }}>
                      <div style={{ height:`${a.h}px`, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:'10px' }}>
                        <span style={{ fontFamily:a.font, fontStyle:a.fstyle, fontSize:`${a.fsize}px`, color:a.fc, textAlign:'center', lineHeight:1.1 }}>{a.label}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px' }}>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--muted)' }}>{a.kind}</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'10px', padding:'3px 7px', borderRadius:'999px', background:a.scoreBg, color:'#fff' }}>{a.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* HUD */}
            <div style={{ position:'absolute', top:'18px', left:'18px', zIndex:10, display:'flex', alignItems:'center', gap:'10px', pointerEvents:'none' }}>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink)', background:'var(--surface)', border:'1px solid var(--line)', padding:'8px 13px', borderRadius:'999px' }}>{canvas.brand} · brand world</span>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)', background:'var(--surface)', border:'1px solid var(--line)', padding:'8px 13px', borderRadius:'999px' }}>drag to pan · scroll to zoom</span>
            </div>
            <div style={{ position:'absolute', top:'18px', right:'18px', zIndex:10, display:'flex', gap:'8px' }}>
              <button onClick={centerBoard} aria-label="Reset view" style={{ width:'40px', height:'40px', borderRadius:'50%', border:'1px solid var(--line)', background:'var(--surface)', color:'var(--ink)', cursor:'pointer', fontSize:'15px' }}>⊙</button>
              <button onClick={() => setOpenBrand(null)} aria-label="Close" style={{ width:'40px', height:'40px', borderRadius:'50%', border:'1px solid var(--line)', background:'var(--ink)', color:'var(--bg)', cursor:'pointer', fontSize:'18px' }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
