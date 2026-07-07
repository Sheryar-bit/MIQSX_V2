'use client';
import { useState, useEffect, useRef } from 'react';
import './features.css';
import SharedNav from '../components/SharedNav';
import MarketingFooter from '../components/MarketingFooter';

const MARQ_A = ('DNA · GUARDIAN · TRILINGUAL · LEARN · ').repeat(10);
const MARQ_B = ('CONSISTENT · ON-BRAND · APPROVED · DESI · ').repeat(10);

const CAPTIONS = [
  'Fresh cakes, baked at home — ready for Eid. 🎂',
  'گھر پر بنے تازہ کیک — عید کے لیے تیار۔ 🎂',
  'Ghar pe bane taaza cake — Eid ke liye tayyar. 🎂',
];
const DIRS = ['ltr', 'rtl', 'ltr'] as const;
const FONTS = ["'General Sans'", "'Newsreader', serif", "'General Sans'"];

export default function FeaturesPage() {
  const [dark, setDark] = useState(false);
  const [langIdx, setLangIdx] = useState(0);
  const langLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const theme = dark ? 'dark' : 'light';

  const startLangLoop = () => {
    if (langLoopRef.current) return;
    langLoopRef.current = setInterval(() => {
      setLangIdx(i => (i + 1) % 3);
    }, 2600);
  };

  useEffect(() => {
    // data-draw
    document.querySelectorAll('[data-draw]').forEach(p => {
      try { const len = Math.ceil((p as SVGGeometryElement).getTotalLength()); (p as HTMLElement).style.setProperty('--len', String(len)); } catch(_) {}
    });

    // calendar build
    const cal = document.querySelector('[data-cal]') as HTMLElement | null;
    if (cal && !cal.childElementCount) {
      const ram = new Set([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]);
      const eid = new Set([31]);
      for (let d = 1; d <= 31; d++) {
        const cell = document.createElement('div');
        cell.textContent = String(d);
        let bg = 'transparent', col = 'var(--muted)', fw = '400';
        if (eid.has(d)) { bg = 'var(--terra)'; col = '#fff'; fw = '700'; }
        else if (ram.has(d)) { bg = 'color-mix(in oklab, var(--leaf) 22%, transparent)'; col = 'var(--ink)'; }
        cell.style.cssText = `aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:${fw}; background:${bg}; color:${col};`;
        cal.appendChild(cell);
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // dial animation
    const runDial = () => {
      document.querySelectorAll('[data-dial]').forEach(c => {
        const target = Number((c as HTMLElement).dataset.target ?? 96);
        const full = 276, st = performance.now(), dur = 1400;
        const num = document.querySelector('[data-dialnum]') as HTMLElement | null;
        const step = (now: number) => {
          const p = Math.min(1, (now - st) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          (c as HTMLElement).style.strokeDashoffset = String(full - full * (target / 100) * e);
          if (num) num.textContent = String(Math.round(target * e));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    // type animation for tone words
    const typeEl = document.querySelector('[data-type]') as HTMLElement | null;
    if (typeEl && !reduce) {
      const full = typeEl.dataset.words || '';
      let i = 0;
      const tick = () => {
        i++;
        typeEl.textContent = full.slice(0, i) + (i < full.length ? '|' : '');
        if (i < full.length) setTimeout(tick, 45);
      };
      setTimeout(tick, 700);
    } else if (typeEl) { typeEl.textContent = typeEl.dataset.words || ''; }

    // scroll reveal + triggered interactions
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); runDial(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.querySelector('[data-dial]')) runDial();
        if (en.target.querySelector('[data-lang-tab]')) startLangLoop();
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => e.classList.add('in')), 4000);

    // magnetic CTA
    const btn = document.querySelector<HTMLElement>('[data-magnetic]');
    const magInner = document.querySelector<HTMLElement>('[data-mag-inner]');
    const icon = document.querySelector<HTMLElement>('[data-arrowicon]');
    if (btn && magInner) {
      btn.addEventListener('mousemove', ev => {
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

    return () => { io.disconnect(); if (langLoopRef.current) clearInterval(langLoopRef.current); };
  }, []);

  function Marquee({ text }: { text: string }) {
    return (
      <div className="fx-marq-row" data-reveal aria-hidden="true">
        <div className="fx-marq-track" style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'14px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--muted)' }}>{text}</div>
      </div>
    );
  }

  function LangTabs() {
    return (
      <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'20px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
        <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
          {['EN','اردو','Roman'].map((label, i) => (
            <button key={i} data-lang-tab data-lang={i}
              onClick={() => { setLangIdx(i); if (!langLoopRef.current) startLangLoop(); }}
              style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', padding:'7px 13px', borderRadius:'999px', border:'1px solid var(--line)', background: langIdx===i ? 'var(--sig)' : 'transparent', color: langIdx===i ? 'var(--onSig)' : 'var(--ink)', cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ height:'122px', borderRadius:'12px', background:'#6F4A2E', marginBottom:'16px', display:'flex', alignItems:'flex-end', padding:'14px' }}>
          <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', color:'#F2E4CE', fontSize:'22px' }}>Fresh for Eid</span>
        </div>
        <div data-lang-text style={{ fontSize:'17px', lineHeight:1.5, minHeight:'52px', direction: DIRS[langIdx], textAlign: DIRS[langIdx]==='rtl' ? 'right' : 'left', fontFamily: FONTS[langIdx] }}>
          {CAPTIONS[langIdx]}
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} style={{ minHeight:'100vh' }}>
      <div data-root style={{ position:'relative', background:'var(--bg)', color:'var(--ink)', fontFamily:"'General Sans', system-ui, sans-serif", minHeight:'100vh', overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>
        <div className="fx-grain" aria-hidden="true" />

        <SharedNav dark={dark} setDark={setDark} />

        {/* HERO */}
        <header id="top" style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(56px, 12vh, 130px) clamp(20px, 5vw, 60px) clamp(30px, 5vh, 60px)' }}>
          <svg aria-hidden="true" width="30" height="30" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', right:'9%', top:'18%', animation:'fx-twinkle 3.4s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <div data-reveal style={{ display:'inline-flex', alignItems:'center', gap:'11px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'26px' }}>
            <span style={{ background:'var(--terra)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>00 / 08</span>Features
          </div>
          <h1 className="fx-head" data-reveal style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(46px, 7.4vw, 100px)', lineHeight:.96, letterSpacing:'-0.035em', margin:0, maxWidth:'14ch' }}>
            Not a logo maker. A brand, <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>on autopilot.</span>
          </h1>
          <p data-reveal style={{ fontSize:'clamp(16px, 1.7vw, 20px)', lineHeight:1.6, color:'var(--muted)', maxWidth:'56ch', margin:'28px 0 0' }}>Eight things MIQSX does so you don&apos;t have to. Each one earns its place — no busywork, no filler, no &ldquo;AI magic&rdquo; hand-waving.</p>
        </header>

        <Marquee text={MARQ_A} />

        {/* MAIN SCENES */}
        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 01 BRAND DNA ENGINE */}
          <section className="fx-scene fx-scene01" data-reveal style={{ position:'relative', padding:0, margin:'clamp(20px,4vh,44px) 0' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'28px', background:'var(--sig)', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, opacity:.12, backgroundImage:'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize:'26px 26px' }} />
              <svg className="fx-spin01" width="180" height="180" viewBox="0 0 40 40" fill="rgba(255,255,255,0.07)" style={{ position:'absolute', bottom:'-50px', left:'-40px' }} aria-hidden="true"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
            </div>
            <div className="fx-text" style={{ position:'relative', padding:'clamp(28px,4vw,52px)', paddingRight:'clamp(10px,2vw,20px)' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--onSig)', opacity:.85, marginBottom:'18px' }}>
                <span style={{ background:'var(--terra)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>01 / 08</span> Brand DNA Engine
              </div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px', color:'var(--onSig)' }}>One brain. Every asset <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'#E0A93C' }}>obeys it.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--onSig)', opacity:.82, margin:0, maxWidth:'42ch' }}>Colors, type, tone, rules — captured once as a structured Brand DNA. Everything MIQSX makes is pulled from this one core, so nothing ever drifts.</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginTop:'22px' }}>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'18px', color:'#E0A93C' }}>one source of truth</span>
                <svg aria-hidden="true" width="72" height="40" viewBox="0 0 72 40" fill="none" style={{ overflow:'visible' }}>
                  <path data-draw style={{ '--len':'74' } as React.CSSProperties} d="M4 12 C 26 6, 46 14, 62 32" stroke="#E0A93C" strokeWidth="2.4" strokeLinecap="round"/>
                  <path data-draw style={{ '--len':'34' } as React.CSSProperties} d="M50 28 L64 35 L66 21" stroke="#E0A93C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="fx-vis" style={{ position:'relative', padding:'clamp(20px,3vw,40px)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'380px' }}>
              <svg viewBox="0 0 320 320" style={{ position:'absolute', width:'min(360px, 96%)', height:'auto', pointerEvents:'none' }} aria-hidden="true">
                <line x1="160" y1="160" x2="160" y2="52" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="4 5"/>
                <line x1="160" y1="160" x2="262" y2="124" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="4 5"/>
                <line x1="160" y1="160" x2="234" y2="252" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="4 5"/>
                <line x1="160" y1="160" x2="78" y2="244" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="4 5"/>
                <line x1="160" y1="160" x2="56" y2="112" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="4 5"/>
              </svg>
              <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:3, width:'96px', height:'96px', borderRadius:'50%', background:'var(--bg)', border:'2px solid #E0A93C', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 18px 40px -16px rgba(0,0,0,.5)' }}>
                <svg width="22" height="22" viewBox="0 0 40 40" fill="var(--sig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
                <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.12em', color:'var(--ink)', marginTop:'3px' }}>DNA</span>
              </div>
              <div style={{ position:'absolute', left:'50%', top:'16%', transform:'translateX(-50%)', zIndex:4, animation:'fx-bob 6s ease-in-out infinite' }}>
                <div style={{ display:'flex', gap:'5px', background:'var(--bg)', borderRadius:'999px', padding:'8px 12px', boxShadow:'0 14px 30px -16px rgba(0,0,0,.5)' }}>
                  <span style={{ width:'15px', height:'15px', borderRadius:'4px', background:'var(--terra)' }} />
                  <span style={{ width:'15px', height:'15px', borderRadius:'4px', background:'#E0A93C' }} />
                  <span style={{ width:'15px', height:'15px', borderRadius:'4px', background:'var(--ink)' }} />
                </div>
              </div>
              <div style={{ position:'absolute', right:'4%', top:'32%', zIndex:4, animation:'fx-bob 7s ease-in-out infinite .5s' }}>
                <div style={{ background:'var(--bg)', borderRadius:'12px', padding:'8px 13px', boxShadow:'0 14px 30px -16px rgba(0,0,0,.5)' }}><span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'24px', color:'var(--ink)' }}>Aa</span></div>
              </div>
              <div style={{ position:'absolute', right:'16%', bottom:'12%', zIndex:4, animation:'fx-bob 6.5s ease-in-out infinite .3s' }}>
                <div style={{ background:'var(--bg)', borderRadius:'999px', padding:'7px 13px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--ink)', boxShadow:'0 14px 30px -16px rgba(0,0,0,.5)' }}>
                  <span data-type data-words="warm · playful">|</span>
                </div>
              </div>
              <div style={{ position:'absolute', left:'12%', bottom:'16%', zIndex:4, animation:'fx-bob 7.5s ease-in-out infinite .6s' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'var(--bg)', borderRadius:'999px', padding:'7px 13px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--leaf)', boxShadow:'0 14px 30px -16px rgba(0,0,0,.5)' }}><span style={{ color:'var(--leaf)' }}>✓</span> rules</div>
              </div>
              <div style={{ position:'absolute', left:'4%', top:'28%', zIndex:4, animation:'fx-bob 6.2s ease-in-out infinite .2s' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'var(--bg)', borderRadius:'999px', padding:'7px 13px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--ink)', boxShadow:'0 14px 30px -16px rgba(0,0,0,.5)' }}>audience</div>
              </div>
              <span aria-hidden="true" style={{ position:'absolute', right:'8%', top:'8%', fontFamily:"'Instrument Serif', serif", fontSize:'30px', color:'#E0A93C', animation:'fx-twinkle 3.4s ease-in-out infinite' }}>✳</span>
            </div>
          </section>
        </main>

        <Marquee text={MARQ_B} />

        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 02 BRAND GUARDIAN */}
          <section className="fx-scene fx-flip" data-reveal>
            <div className="fx-text">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--ink)', marginBottom:'16px' }}><span style={{ background:'var(--terra)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>02 / 08</span> Brand Guardian</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px' }}>It grades its own <span style={{ color:'var(--terra)' }}>homework.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--muted)', margin:0, maxWidth:'42ch' }}>Every asset gets a 0–100 score before anyone sees it. Pass, or get flagged with the exact reason. <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'13px', color:'var(--terra)' }}>(hover the red card)</span></p>
            </div>
            <div className="fx-vis">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div style={{ background:'var(--surface)', border:'1px solid color-mix(in oklab, var(--leaf) 40%, var(--line))', borderRadius:'16px', padding:'18px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
                  <div style={{ position:'relative', width:'104px', height:'104px' }}>
                    <svg width="104" height="104" viewBox="0 0 104 104">
                      <circle cx="52" cy="52" r="44" fill="none" stroke="var(--line)" strokeWidth="9"/>
                      <circle data-dial data-target="96" cx="52" cy="52" r="44" fill="none" stroke="var(--leaf)" strokeWidth="9" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="276" transform="rotate(-90 52 52)"/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <span data-dialnum data-target="96" style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'26px' }}>0</span>
                      <span style={{ fontSize:'9px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--leaf)' }}>pass ✓</span>
                    </div>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)' }}>post_a</span>
                </div>
                <div className="fx-flagcard" style={{ background:'var(--surface)', border:'1px solid color-mix(in oklab, var(--red) 42%, var(--line))', borderRadius:'16px', padding:'18px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <div style={{ width:'104px', height:'104px', borderRadius:'50%', border:'9px solid var(--red)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'26px', color:'var(--red)' }}>54</span>
                    <span style={{ fontSize:'9px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--red)' }}>flag ✗</span>
                  </div>
                  <span className="fx-flag" style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10.5px', lineHeight:1.4, color:'var(--red)', textAlign:'center' }}>off-palette blue · wrong tone</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Marquee text={MARQ_A} />

        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 03 AI FOCUS GROUP */}
          <section className="fx-scene fx-scene01" data-reveal style={{ position:'relative', padding:0, margin:'clamp(20px,4vh,44px) 0' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'28px', background:'var(--olive)', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, opacity:.1, backgroundImage:'repeating-linear-gradient(45deg, rgba(255,255,255,.5) 0 1px, transparent 1px 16px)' }} />
            </div>
            <div className="fx-text" style={{ position:'relative', padding:'clamp(28px,4vw,52px)', paddingRight:'clamp(10px,2vw,20px)' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'#fff', opacity:.9, marginBottom:'18px' }}><span style={{ background:'var(--ink)', color:'var(--bg)', padding:'3px 8px', borderRadius:'4px' }}>03 / 08</span> AI Focus Group</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px', color:'#fff' }}>Test it on a crowd that <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--bg)' }}>never sleeps.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'#fff', opacity:.85, margin:0, maxWidth:'42ch' }}>Run a tagline past synthetic personas built from your real audience. Honest reactions, scored — before you spend a rupee on ads.</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginTop:'22px' }}>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'18px', color:'var(--bg)' }}>they don&apos;t hold back</span>
                <svg aria-hidden="true" width="72" height="40" viewBox="0 0 72 40" fill="none" style={{ overflow:'visible' }}>
                  <path data-draw style={{ '--len':'74' } as React.CSSProperties} d="M4 12 C 26 6, 46 14, 62 32" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round"/>
                  <path data-draw style={{ '--len':'34' } as React.CSSProperties} d="M50 28 L64 35 L66 21" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="fx-vis" style={{ position:'relative', padding:'clamp(20px,3vw,40px)', minHeight:'392px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%) rotate(-2deg)', zIndex:3, width:'min(220px, 64%)', background:'var(--bg)', borderRadius:'16px', padding:'18px', boxShadow:'0 22px 50px -22px rgba(0,0,0,.55)', textAlign:'center' }}>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'8px' }}>Testing tagline</div>
                <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'21px', color:'var(--ink)', lineHeight:1.2 }}>&ldquo;Fresh for Eid&rdquo;</div>
                <div style={{ marginTop:'12px', display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', background:'color-mix(in oklab, var(--leaf) 18%, var(--bg))', border:'1px solid color-mix(in oklab, var(--leaf) 38%, transparent)', borderRadius:'999px', padding:'5px 11px', color:'var(--ink)' }}>avg <strong style={{ color:'var(--leaf)', fontWeight:700 }}>7.7</strong>/10</div>
              </div>
              <div style={{ position:'absolute', left:'2%', top:'6%', zIndex:4, width:'168px', background:'var(--bg)', borderRadius:'13px 13px 13px 3px', padding:'11px 13px', boxShadow:'0 16px 36px -22px rgba(0,0,0,.5)', animation:'fx-bob 6s ease-in-out infinite' }}><div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}><span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--olive)' }}>Ayesha · mum</span><span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'12px', color:'var(--leaf)' }}>8</span></div><span style={{ fontSize:'12.5px' }}>&ldquo;Feels homemade ❤&rdquo;</span></div>
              <div style={{ position:'absolute', right:'1%', top:'20%', zIndex:4, width:'168px', background:'var(--bg)', borderRadius:'13px 13px 3px 13px', padding:'11px 13px', boxShadow:'0 16px 36px -22px rgba(0,0,0,.5)', animation:'fx-bob 7s ease-in-out infinite .5s' }}><div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}><span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--olive)' }}>Bilal · foodie</span><span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'12px', color:'var(--terra)' }}>6</span></div><span style={{ fontSize:'12.5px' }}>&ldquo;Bit safe na?&rdquo;</span></div>
              <div style={{ position:'absolute', left:'14%', bottom:'5%', zIndex:4, width:'176px', background:'var(--bg)', borderRadius:'13px 13px 13px 3px', padding:'11px 13px', boxShadow:'0 16px 36px -22px rgba(0,0,0,.5)', animation:'fx-bob 6.6s ease-in-out infinite .3s' }}><div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}><span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--olive)' }}>Sana · planner</span><span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'12px', color:'var(--leaf)' }}>9</span></div><span style={{ fontSize:'12.5px' }}>&ldquo;Exactly the Eid vibe&rdquo;</span></div>
              <span aria-hidden="true" style={{ position:'absolute', right:'9%', bottom:'12%', fontFamily:"'Instrument Serif', serif", fontSize:'28px', color:'var(--bg)', animation:'fx-twinkle 3.6s ease-in-out infinite' }}>✳</span>
            </div>
          </section>
        </main>

        <Marquee text={MARQ_B} />

        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 04 TRILINGUAL CAPTIONS */}
          <section className="fx-scene fx-flip" data-reveal>
            <div className="fx-text">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--ink)', marginBottom:'16px' }}><span style={{ background:'var(--blue)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>04 / 08</span> Trilingual Captions</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px' }}>Speaks your customer&apos;s language. <span style={{ color:'var(--blue)' }}>All of them.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--muted)', margin:0, maxWidth:'42ch' }}>English, Urdu, and Roman Urdu — same meaning, same tone, native in each. Tap to switch.</p>
            </div>
            <div className="fx-vis"><LangTabs /></div>
          </section>

          {/* 05 LOGO STRESS TEST */}
          <section className="fx-scene fx-scene01" data-reveal style={{ position:'relative', padding:0, margin:'clamp(20px,4vh,44px) 0' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'28px', background:'#1A1410', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, opacity:.5, backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize:'30px 30px' }} />
            </div>
            <div className="fx-text" style={{ position:'relative', padding:'clamp(28px,4vw,52px)', paddingRight:'clamp(10px,2vw,20px)' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'#EFE7D8', opacity:.9, marginBottom:'18px' }}><span style={{ background:'var(--terra)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>05 / 08</span> Logo Stress Test</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px', color:'#EFE7D8' }}>Survives the favicon. Survives the <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--terra)' }}>fax machine.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'#EFE7D8', opacity:.72, margin:0, maxWidth:'42ch' }}>Vector logos, checked at every size and in black, white, and inverted. If it breaks anywhere, you&apos;ll catch it here — not after print.</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginTop:'22px' }}>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'18px', color:'var(--terra)' }}>shrinks without breaking</span>
                <svg aria-hidden="true" width="72" height="40" viewBox="0 0 72 40" fill="none" style={{ overflow:'visible' }}>
                  <path data-draw style={{ '--len':'74' } as React.CSSProperties} d="M4 12 C 26 6, 46 14, 62 32" stroke="var(--terra)" strokeWidth="2.4" strokeLinecap="round"/>
                  <path data-draw style={{ '--len':'34' } as React.CSSProperties} d="M50 28 L64 35 L66 21" stroke="var(--terra)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="fx-vis" style={{ position:'relative', padding:'clamp(20px,3vw,40px)', minHeight:'360px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'100%', maxWidth:'400px', display:'grid', gridTemplateColumns:'1.4fr 1fr', gridTemplateRows:'auto auto', gap:'12px' }}>
                <div style={{ gridRow:'span 2', background:'#0E0A07', border:'1px solid rgba(255,255,255,.1)', borderRadius:'16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', minHeight:'180px', position:'relative' }}>
                  <span style={{ position:'absolute', top:'10px', left:'12px', fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:'rgba(255,255,255,.4)' }}>100%</span>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'44px', color:'#E9D9C0' }}>Saha</span>
                </div>
                <div style={{ background:'#0E0A07', border:'1px solid rgba(255,255,255,.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', minHeight:'78px', position:'relative' }}>
                  <span style={{ position:'absolute', top:'8px', left:'10px', fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:'rgba(255,255,255,.4)' }}>16PX</span>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'13px', color:'#E9D9C0' }}>Saha</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:'var(--leaf)' }}>✓</span>
                </div>
                <div style={{ background:'#E9D9C0', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'78px', position:'relative' }}>
                  <span style={{ position:'absolute', top:'8px', left:'10px', fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:'rgba(0,0,0,.4)' }}>INVERT</span>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'26px', color:'#1A1410' }}>Saha</span>
                </div>
                <div style={{ gridColumn:'1 / -1', background:'#0E0A07', border:'1px solid rgba(255,255,255,.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px' }}>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', color:'rgba(255,255,255,.4)' }}>B&amp;W · MONO</span>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'24px', color:'#E9D9C0', filter:'grayscale(1)' }}>Saha</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--leaf)' }}>all pass ✓</span>
                </div>
              </div>
              <span aria-hidden="true" style={{ position:'absolute', right:'6%', top:'8%', fontFamily:"'Instrument Serif', serif", fontSize:'26px', color:'var(--terra)', animation:'fx-twinkle 3.5s ease-in-out infinite' }}>✳</span>
            </div>
          </section>
        </main>

        <Marquee text={MARQ_A} />

        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 06 DESI CONTENT CALENDAR */}
          <section className="fx-scene fx-flip" data-reveal>
            <div className="fx-text">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--ink)', marginBottom:'16px' }}><span style={{ background:'var(--sig)', color:'var(--onSig)', padding:'3px 8px', borderRadius:'4px' }}>06 / 08</span> Desi Content Calendar</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px' }}>Knows it&apos;s almost Eid <span style={{ color:'var(--sig)' }}>before you do.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--muted)', margin:0, maxWidth:'42ch' }}>A calendar that actually knows the local year — Ramadan, Eid, 14 August — and lines up your posts for them automatically.</p>
            </div>
            <div className="fx-vis">
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'20px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                  <span style={{ fontFamily:"'General Sans'", fontWeight:700, fontSize:'17px' }}>March</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)' }}>2025</span>
                </div>
                <div data-cal style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'6px' }} />
                <div style={{ display:'flex', gap:'16px', marginTop:'14px', fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--muted)' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}><span style={{ width:'9px', height:'9px', borderRadius:'3px', background:'var(--leaf)' }} />Ramadan</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}><span style={{ width:'9px', height:'9px', borderRadius:'3px', background:'var(--terra)' }} />Eid</span>
                </div>
              </div>
            </div>
          </section>

          {/* 07 TEAM + WHATSAPP */}
          <section className="fx-scene fx-scene01" data-reveal style={{ position:'relative', padding:0, margin:'clamp(20px,4vh,44px) 0' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'28px', background:'var(--surf2)', border:'1.5px dashed color-mix(in oklab, var(--olive) 55%, var(--line))', overflow:'hidden' }}>
              <svg className="fx-spin01" width="150" height="150" viewBox="0 0 40 40" fill="color-mix(in oklab, var(--olive) 16%, transparent)" style={{ position:'absolute', top:'-36px', right:'-30px' }} aria-hidden="true"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
            </div>
            <div className="fx-text" style={{ position:'relative', padding:'clamp(28px,4vw,52px)', paddingRight:'clamp(10px,2vw,20px)' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--ink)', marginBottom:'18px' }}><span style={{ background:'var(--olive)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>07 / 08</span> Team + WhatsApp Approval</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px', color:'var(--ink)' }}>Approved in two taps. <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--olive)' }}>No login. No app.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--muted)', margin:0, maxWidth:'42ch' }}>Move work Draft → Review → Approved, then send the final to your client on WhatsApp. They tap once. You both move on.</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginTop:'22px' }}>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'18px', color:'var(--olive)' }}>where they already are</span>
                <svg aria-hidden="true" width="72" height="40" viewBox="0 0 72 40" fill="none" style={{ overflow:'visible' }}>
                  <path data-draw style={{ '--len':'74' } as React.CSSProperties} d="M4 12 C 26 6, 46 14, 62 32" stroke="var(--olive)" strokeWidth="2.4" strokeLinecap="round"/>
                  <path data-draw style={{ '--len':'34' } as React.CSSProperties} d="M50 28 L64 35 L66 21" stroke="var(--olive)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="fx-vis" style={{ position:'relative', padding:'clamp(20px,3vw,40px)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', minHeight:'360px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', flex:1, maxWidth:'178px' }}>
                <div style={{ background:'var(--bg)', border:'1px solid var(--line)', borderRadius:'12px', padding:'11px 13px', boxShadow:'0 12px 28px -22px rgba(0,0,0,.4)' }}><div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'7px' }}>Draft</div><div style={{ height:'26px', borderRadius:'6px', background:'var(--terra)', opacity:.45 }} /></div>
                <div style={{ background:'var(--bg)', border:'1px solid var(--line)', borderRadius:'12px', padding:'11px 13px', boxShadow:'0 12px 28px -22px rgba(0,0,0,.4)', marginLeft:'14px' }}><div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'7px' }}>Review</div><div style={{ height:'26px', borderRadius:'6px', background:'#E0A93C', opacity:.6 }} /></div>
                <div style={{ background:'var(--bg)', border:'1px solid color-mix(in oklab, var(--leaf) 40%, var(--line))', borderRadius:'12px', padding:'11px 13px', boxShadow:'0 12px 28px -22px rgba(0,0,0,.4)', marginLeft:'28px' }}><div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--leaf)', marginBottom:'7px' }}>Approved ✓</div><div style={{ height:'26px', borderRadius:'6px', background:'var(--leaf)' }} /></div>
              </div>
              <svg aria-hidden="true" width="54" height="40" viewBox="0 0 54 40" fill="none" style={{ flex:'0 0 auto', overflow:'visible' }}>
                <path data-draw style={{ '--len':'52' } as React.CSSProperties} d="M2 20 C 18 12, 34 12, 48 20" stroke="var(--olive)" strokeWidth="2.4" strokeLinecap="round"/>
                <path data-draw style={{ '--len':'30' } as React.CSSProperties} d="M38 13 L50 20 L40 28" stroke="var(--olive)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ flex:'0 0 auto', width:'150px', borderRadius:'24px', background:'var(--ink)', padding:'6px', boxShadow:'0 28px 54px -28px rgba(0,0,0,.55)', transform:'rotate(2deg)' }}>
                <div style={{ borderRadius:'19px', overflow:'hidden', background:'var(--bg)' }}>
                  <div style={{ background:'var(--sig)', color:'var(--onSig)', padding:'10px', fontFamily:"'JetBrains Mono', monospace", fontSize:'8.5px', letterSpacing:'.04em' }}>miqsx.link/saha</div>
                  <div style={{ padding:'11px' }}>
                    <div style={{ height:'56px', borderRadius:'9px', background:'#6F4A2E', marginBottom:'10px', display:'flex', alignItems:'flex-end', padding:'8px' }}><span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', color:'#F2E4CE', fontSize:'13px' }}>Fresh for Eid</span></div>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'10px' }}>Approve this post?</div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <span style={{ flex:1, textAlign:'center', background:'var(--leaf)', color:'#fff', fontWeight:700, fontSize:'10px', padding:'8px', borderRadius:'7px' }}>Approve ✓</span>
                      <span style={{ flex:1, textAlign:'center', background:'var(--surf2)', border:'1px solid var(--line)', fontSize:'10px', padding:'8px', borderRadius:'7px' }}>Edit</span>
                    </div>
                  </div>
                </div>
              </div>
              <span aria-hidden="true" style={{ position:'absolute', left:'6%', bottom:'10%', fontFamily:"'Instrument Serif', serif", fontSize:'26px', color:'var(--olive)', animation:'fx-twinkle 3.7s ease-in-out infinite' }}>✳</span>
            </div>
          </section>
        </main>

        <Marquee text={MARQ_B} />

        <main style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'0 clamp(20px, 5vw, 60px)' }}>

          {/* 08 LEARNING LOOP */}
          <section className="fx-scene fx-flip" data-reveal>
            <div className="fx-text">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', color:'var(--ink)', marginBottom:'16px' }}><span style={{ background:'var(--leaf)', color:'#fff', padding:'3px 8px', borderRadius:'4px' }}>08 / 08</span> Learning Loop</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:'0 0 14px' }}>Gets sharper every time you <span style={{ color:'var(--leaf)' }}>say no.</span></h2>
              <p style={{ fontSize:'17px', lineHeight:1.6, color:'var(--muted)', margin:0, maxWidth:'42ch' }}>Every approval and rejection teaches MIQSX this specific brand. The longer you use it, the less you correct. That&apos;s the moat.</p>
            </div>
            <div className="fx-vis">
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'22px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>Consistency · 90 days</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'18px', color:'var(--leaf)' }}>+34</span>
                </div>
                <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ display:'block' }}>
                  <polyline data-draw style={{ '--len':'320' } as React.CSSProperties} points="0,96 50,90 100,78 150,60 200,46 250,28 300,16" fill="none" stroke="var(--leaf)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="300" cy="16" r="5" fill="var(--leaf)"/>
                </svg>
                <div style={{ marginTop:'14px', display:'inline-flex', alignItems:'center', gap:'9px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', color:'var(--ink)', background:'var(--surf2)', border:'1px solid var(--line)', borderRadius:'999px', padding:'7px 13px' }}>
                  <span style={{ color:'var(--leaf)' }}>learned:</span> this brand hates gradients
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* CLOSING */}
        <section style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(56px, 12vh, 140px) clamp(20px, 5vw, 60px)', textAlign:'center' }}>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', left:'13%', top:'20%', animation:'fx-twinkle 3.6s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <h2 data-reveal style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(36px, 6vw, 84px)', lineHeight:1.0, letterSpacing:'-0.035em', margin:'0 auto', maxWidth:'16ch' }}>Generation is easy. <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>Judgment isn&apos;t.</span></h2>
          <div data-reveal style={{ display:'flex', flexWrap:'wrap', gap:'14px', justifyContent:'center', marginTop:'38px' }}>
            <a href="/auth/signup" style={{ textDecoration:'none', color:'var(--onSig)', background:'var(--sig)', fontWeight:600, fontSize:'17px', padding:'16px 30px', borderRadius:'999px', display:'inline-flex', alignItems:'center', gap:'9px' }}>Build your brand <span>↗</span></a>
            <a href="/gallery" style={{ textDecoration:'none', color:'var(--ink)', fontWeight:600, fontSize:'17px', padding:'16px 8px', display:'inline-flex', alignItems:'center', gap:'8px' }}>See the gallery <span style={{ color:'var(--terra)' }}>↓</span></a>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </div>
  );
}
