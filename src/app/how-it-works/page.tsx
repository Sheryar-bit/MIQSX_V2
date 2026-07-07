'use client';
import { useState, useEffect } from 'react';
import './how-it-works.css';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

export default function HowItWorksPage() {
  const [dark, setDark] = useState(false);
  const theme = dark ? 'dark' : 'light';

  useEffect(() => {
    document.querySelectorAll('[data-draw]').forEach(p => {
      try { const len = Math.ceil((p as SVGGeometryElement).getTotalLength()); (p as HTMLElement).style.setProperty('--len', String(len)); } catch(_) {}
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(e => io.observe(e));
    setTimeout(() => document.querySelectorAll('[data-reveal]:not(.in)').forEach(e => e.classList.add('in')), 4000);
    return () => io.disconnect();
  }, []);

  const uhCards = [
    { n:'01', title:'What Brand DNA stores', body:'A structured object: hex colors, font pairings, tone descriptors, audience, style keywords, and explicit do / don\'t rules. Not a vibe — a record.' },
    { n:'02', title:'How Guardian scores', body:'Color compliance via palette extraction + copy tone analysis + style match, combined into a 0–100 score with the specific violations named.' },
    { n:'03', title:'Why logos are vector', body:'Logos are composed as SVG so they stay sharp and editable at any size. AI raster generation is reserved for imagery only — never the mark.' },
    { n:'04', title:'Where AI is — and isn\'t', body:'AI drafts and scores. Humans always approve. MIQSX assists; it doesn\'t decide. The final call is never automated.' },
    { n:'05', title:'The learning loop, concretely', body:'Approved and rejected examples — with their reasons — become few-shot context for the next generation, per brand. It compounds.' },
    { n:'06', title:'Built to run lean', body:'Designed around efficient AI usage so it stays genuinely affordable for the Pakistani market — not priced for the Valley.' },
  ];

  return (
    <div data-theme={theme} style={{ minHeight:'100vh' }}>
      <div data-root style={{ position:'relative', background:'var(--bg)', color:'var(--ink)', fontFamily:"'General Sans', system-ui, sans-serif", minHeight:'100vh', overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>
        <div className="hw-grain" aria-hidden="true" />

        <MarketingNav dark={dark} setDark={setDark} current="/how-it-works" />

        {/* HERO */}
        <header style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(56px, 12vh, 130px) clamp(20px, 5vw, 60px) clamp(40px, 7vh, 80px)' }}>
          <svg aria-hidden="true" width="30" height="30" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', right:'8%', top:'16%', animation:'hw-twinkle 3.4s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <div data-reveal style={{ display:'inline-flex', alignItems:'center', gap:'11px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'26px' }}>
            <span style={{ width:'30px', height:'1px', background:'var(--terra)' }} />How it works
          </div>
          <h1 className="hw-head" data-reveal style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(46px, 7vw, 96px)', lineHeight:.98, letterSpacing:'-0.035em', margin:0, maxWidth:'15ch' }}>
            Watch one brand <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>come to life.</span>
          </h1>
          <p data-reveal style={{ fontSize:'clamp(16px, 1.7vw, 20px)', lineHeight:1.6, color:'var(--muted)', maxWidth:'58ch', margin:'28px 0 0' }}>
            Forget the feature list. Here&apos;s exactly what happens when a real freelancer brings a real brand into MIQSX — and what&apos;s running under the hood.
          </p>
        </header>

        {/* WORKED EXAMPLE */}
        <section id="story" style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(40px, 7vh, 80px) clamp(20px, 5vw, 60px) 0' }}>
          <span className="hw-doodle" aria-hidden="true" style={{ right:'6%', top:'4%', fontFamily:"'Instrument Serif', serif", fontSize:'42px', color:'var(--olive)', animation:'hw-spin 16s linear infinite', transformOrigin:'50% 56%' }}>✳</span>

          <div data-reveal style={{ position:'relative', marginBottom:'clamp(40px, 7vh, 80px)', maxWidth:'60ch' }}>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'16px' }}>The worked example</div>
            <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.6vw, 46px)', lineHeight:1.05, letterSpacing:'-0.025em', margin:0 }}>Meet <span style={{ color:'var(--sig)' }}>Saha</span> — a home bakery in Karachi, brought in by her freelance designer.</h2>
            <div style={{ display:'flex', alignItems:'center', gap:'14px', marginTop:'18px' }}>
              <p style={{ fontSize:'16px', lineHeight:1.6, color:'var(--muted)', margin:0 }}>One brand, start to finish. Scroll to follow it.</p>
              <svg aria-hidden="true" width="86" height="54" viewBox="0 0 86 54" fill="none" style={{ flex:'0 0 auto', overflow:'visible' }}>
                <path data-draw style={{ '--len':'92' } as React.CSSProperties} d="M4 10 C 26 6, 52 14, 70 42" stroke="var(--terra)" strokeWidth="2.6" strokeLinecap="round"/>
                <path data-draw style={{ '--len':'40' } as React.CSSProperties} d="M58 38 L72 45 L74 30" stroke="var(--terra)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* SCENE 1 */}
          <div className="hw-scene" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'14px' }}>Scene 01 · The messy brief</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>It starts the way every brief does — scattered.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>The client fires off voice-notes and half-thoughts on WhatsApp. MIQSX&apos;s <strong style={{ color:'var(--ink)', fontWeight:600 }}>Brief Parser</strong> reads the mess and turns it into a clean, structured brief — requirements, colors, deadline.</p>
            </div>
            <div className="hw-vis">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                  <span style={{ alignSelf:'flex-start', maxWidth:'90%', background:'var(--surf2)', border:'1px solid var(--line)', borderRadius:'14px 14px 14px 4px', padding:'10px 13px', fontSize:'13.5px', lineHeight:1.4 }}>brown rakhna… nahi cream 😅</span>
                  <span style={{ alignSelf:'flex-start', maxWidth:'90%', background:'var(--surf2)', border:'1px solid var(--line)', borderRadius:'4px 14px 14px 14px', padding:'10px 13px', fontSize:'13.5px', lineHeight:1.4 }}>kuch homemade type feel</span>
                  <span style={{ alignSelf:'flex-start', maxWidth:'90%', background:'var(--surf2)', border:'1px solid var(--line)', borderRadius:'4px 14px 14px 14px', padding:'10px 13px', fontSize:'13.5px', lineHeight:1.4 }}>logo chahiye + insta posts, Eid se pehle</span>
                  <span style={{ alignSelf:'flex-end', maxWidth:'80%', background:'color-mix(in oklab, var(--leaf) 22%, var(--surface))', border:'1px solid color-mix(in oklab, var(--leaf) 40%, var(--line))', borderRadius:'14px 14px 4px 14px', padding:'10px 13px', fontSize:'13.5px', lineHeight:1.4, color:'var(--ink)' }}>got it — parsing now ✓</span>
                </div>
                <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'18px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'14px' }}>Parsed brief</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'11px', fontSize:'13px' }}>
                    <div><span style={{ color:'var(--muted)' }}>Deliverables</span><br/><strong style={{ fontWeight:600 }}>Logo · 6 IG posts</strong></div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}><span style={{ color:'var(--muted)' }}>Palette</span><span style={{ width:'18px', height:'18px', borderRadius:'5px', background:'#6F4A2E' }} /><span style={{ width:'18px', height:'18px', borderRadius:'5px', background:'#C9A06B' }} /><span style={{ width:'18px', height:'18px', borderRadius:'5px', background:'#F2E4CE' }} /></div>
                    <div><span style={{ color:'var(--muted)' }}>Feel</span> <strong style={{ fontWeight:600 }}>homemade, warm</strong></div>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', color:'var(--terra)' }}><span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--terra)' }} />Due: before Eid</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 2 */}
          <div className="hw-scene hw-flip" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--sig)', marginBottom:'14px' }}>Scene 02 · The interview</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>A few sharp questions, and the brand finds its voice.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>The <strong style={{ color:'var(--ink)', fontWeight:600 }}>AI Strategist</strong> asks what matters — who&apos;s buying, why, and how it should feel. From these answers, the <strong style={{ color:'var(--ink)', fontWeight:600 }}>Brand DNA</strong> is born.</p>
            </div>
            <div className="hw-vis">
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'20px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)', display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--sig)', marginBottom:'8px' }}><span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--sig)' }} />STRATEGIST</div>
                  <div style={{ background:'var(--surf2)', borderRadius:'12px', padding:'12px 14px', fontSize:'14px' }}>Who&apos;s actually placing the order?</div>
                  <div style={{ textAlign:'right', marginTop:'8px' }}><span style={{ display:'inline-block', background:'color-mix(in oklab, var(--sig) 16%, var(--surface))', border:'1px solid color-mix(in oklab, var(--sig) 32%, var(--line))', borderRadius:'12px', padding:'10px 13px', fontSize:'14px' }}>Mums ordering birthday cakes 🎂</span></div>
                </div>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--sig)', marginBottom:'8px' }}><span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--sig)' }} />STRATEGIST</div>
                  <div style={{ background:'var(--surf2)', borderRadius:'12px', padding:'12px 14px', fontSize:'14px' }}>Three words for how Saha should feel?</div>
                  <div style={{ textAlign:'right', marginTop:'8px' }}><span style={{ display:'inline-block', background:'color-mix(in oklab, var(--sig) 16%, var(--surface))', border:'1px solid color-mix(in oklab, var(--sig) 32%, var(--line))', borderRadius:'12px', padding:'10px 13px', fontSize:'14px' }}>warm · homemade · trustworthy</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 3 */}
          <div className="hw-scene" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--leaf)', marginBottom:'14px' }}>Scene 03 · The DNA card</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>One source of truth. Everything builds from here.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>Saha&apos;s Brand DNA: palette, font pairing, tone, and rules. Every future asset is generated <em style={{ fontStyle:'italic', color:'var(--ink)' }}>from this object</em> — not from scratch.</p>
            </div>
            <div className="hw-vis">
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'20px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}><span style={{ fontFamily:"'General Sans'", fontWeight:700, fontSize:'19px' }}>Saha · Brand DNA</span><span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.1em', color:'var(--leaf)' }}>v1</span></div>
                <div style={{ display:'flex', gap:'7px', marginBottom:'16px' }}>
                  {['#6F4A2E','#A9743F','#C9A06B','#F2E4CE'].map((c,i) => <span key={i} style={{ flex:1, height:'34px', borderRadius:'7px', background:c }} />)}
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:'10px', borderBottom:'1px solid var(--line)', paddingBottom:'14px', marginBottom:'14px' }}>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'30px' }}>Saha</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)' }}>Instrument Serif + General Sans</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginBottom:'16px' }}>
                  {['warm','homemade','trustworthy'].map(t => <span key={t} style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', padding:'5px 10px', borderRadius:'999px', background:'var(--surf2)', border:'1px solid var(--line)' }}>{t}</span>)}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', fontSize:'12.5px' }}>
                  <div><div style={{ color:'var(--leaf)', fontWeight:700, marginBottom:'5px' }}>✓ Do</div><div style={{ color:'var(--muted)', lineHeight:1.5 }}>Hand-drawn touches · warm browns</div></div>
                  <div><div style={{ color:'var(--red)', fontWeight:700, marginBottom:'5px' }}>✗ Don&apos;t</div><div style={{ color:'var(--muted)', lineHeight:1.5 }}>Gradients · cold blues</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 4 */}
          <div className="hw-scene hw-flip" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--olive)', marginBottom:'14px' }}>Scene 04 · Generation</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Assets, on brand by default.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>A wordmark, social posts, and captions in <strong style={{ color:'var(--ink)', fontWeight:600 }}>English, Urdu, and Roman Urdu</strong> — all drawn from the DNA, so they already match.</p>
            </div>
            <div className="hw-vis">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'16px', padding:'22px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)' }}><span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'38px', color:'#6F4A2E' }}>Saha</span></div>
                <div style={{ borderRadius:'16px', overflow:'hidden', background:'#6F4A2E', position:'relative', minHeight:'110px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)' }}>
                  <div style={{ position:'absolute', inset:0, padding:'14px', display:'flex', flexDirection:'column', justifyContent:'flex-end', color:'#F2E4CE' }}>
                    <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'22px' }}>Fresh for Eid</span>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9px', opacity:.8, marginTop:'3px' }}>@saha.bakes</span>
                  </div>
                </div>
                <div style={{ gridColumn:'1 / -1', background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'16px', padding:'16px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)' }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'10px' }}>Caption · 3 languages</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', fontSize:'13.5px' }}>
                    <span>Fresh cakes, baked at home 🎂</span>
                    <span style={{ direction:'rtl', textAlign:'right', fontFamily:"'Newsreader', serif" }}>گھر پر بنے تازہ کیک</span>
                    <span style={{ fontStyle:'italic', color:'var(--muted)' }}>Ghar pe bane taaza cake</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 5 */}
          <div className="hw-scene" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'14px' }}>Scene 05 · Guardian catches a mistake</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Nothing off-brand slips through.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}><strong style={{ color:'var(--ink)', fontWeight:600 }}>Brand Guardian</strong> scores every asset 0–100. On-brand work passes; anything off gets flagged with a reason — before the client ever sees it.</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginTop:'20px' }}>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'19px', color:'var(--terra)' }}>caught in the act</span>
                <svg aria-hidden="true" width="76" height="44" viewBox="0 0 76 44" fill="none" style={{ overflow:'visible' }}>
                  <path data-draw style={{ '--len':'80' } as React.CSSProperties} d="M4 14 C 28 8, 50 16, 66 36" stroke="var(--terra)" strokeWidth="2.6" strokeLinecap="round"/>
                  <path data-draw style={{ '--len':'38' } as React.CSSProperties} d="M54 32 L68 39 L70 24" stroke="var(--terra)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="hw-vis">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div style={{ background:'var(--surface)', border:'1px solid color-mix(in oklab, var(--leaf) 40%, var(--line))', borderRadius:'16px', padding:'16px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)' }}>
                  <div style={{ height:'80px', borderRadius:'10px', background:'#6F4A2E', marginBottom:'12px' }} />
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)' }}>post_a</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'14px', color:'#fff', background:'var(--leaf)', padding:'4px 10px', borderRadius:'999px' }}>96 ✓</span>
                  </div>
                </div>
                <div style={{ background:'var(--surface)', border:'1px solid color-mix(in oklab, var(--red) 42%, var(--line))', borderRadius:'16px', padding:'16px', boxShadow:'0 20px 44px -30px rgba(0,0,0,.4)' }}>
                  <div style={{ height:'80px', borderRadius:'10px', background:'#3A6EA5', marginBottom:'12px', position:'relative' }}><span style={{ position:'absolute', top:'7px', right:'7px', fontSize:'14px' }}>⚠</span></div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'9px' }}>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--muted)' }}>post_b</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'14px', color:'#fff', background:'var(--red)', padding:'4px 10px', borderRadius:'999px' }}>54 ✗</span>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10.5px', lineHeight:1.4, color:'var(--red)' }}>off-palette blue · wrong tone</div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 6 */}
          <div className="hw-scene hw-flip" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--sig)', marginBottom:'14px' }}>Scene 06 · Client approves on WhatsApp</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Sign-off where the client already is.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>A simple approval link — tap <strong style={{ color:'var(--ink)', fontWeight:600 }}>Approve</strong> or request changes. No login, no app to download.</p>
            </div>
            <div className="hw-vis" style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ width:'244px', borderRadius:'34px', background:'var(--ink)', padding:'9px', boxShadow:'0 30px 60px -30px rgba(0,0,0,.5)' }}>
                <div style={{ borderRadius:'27px', overflow:'hidden', background:'var(--surface)' }}>
                  <div style={{ background:'var(--sig)', color:'var(--onSig)', padding:'16px', fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.08em' }}>miqsx.link/saha-eid</div>
                  <div style={{ padding:'16px' }}>
                    <div style={{ height:'116px', borderRadius:'12px', background:'#6F4A2E', marginBottom:'12px', display:'flex', alignItems:'flex-end', padding:'12px' }}><span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', color:'#F2E4CE', fontSize:'20px' }}>Fresh for Eid</span></div>
                    <div style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'14px' }}>Approve this post for @saha.bakes?</div>
                    <div style={{ display:'flex', gap:'9px' }}>
                      <span style={{ flex:1, textAlign:'center', background:'var(--leaf)', color:'#fff', fontWeight:700, fontSize:'13px', padding:'11px', borderRadius:'10px' }}>Approve ✓</span>
                      <span style={{ flex:1, textAlign:'center', background:'var(--surf2)', border:'1px solid var(--line)', fontSize:'13px', padding:'11px', borderRadius:'10px' }}>Changes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCENE 7 */}
          <div className="hw-scene" data-reveal>
            <div className="hw-text">
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--leaf)', marginBottom:'14px' }}>Scene 07 · Three months later</div>
              <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(24px, 2.8vw, 34px)', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 16px' }}>It gets smarter with every approval.</h3>
              <p style={{ fontSize:'16px', lineHeight:1.65, color:'var(--muted)', margin:0 }}>MIQSX now knows Saha rejects gradients and loves hand-drawn touches. Every new post starts smarter. <em style={{ fontStyle:'italic', color:'var(--ink)' }}>This is the part competitors can&apos;t copy.</em></p>
            </div>
            <div className="hw-vis">
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'18px', padding:'22px', boxShadow:'0 24px 50px -30px rgba(0,0,0,.4)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>Consistency · 90 days</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'18px', color:'var(--leaf)' }}>+34</span>
                </div>
                <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ display:'block' }}>
                  <polyline points="0,96 50,90 100,78 150,60 200,46 250,28 300,16" fill="none" stroke="var(--leaf)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="0,96 50,90 100,78 150,60 200,46 250,28 300,16 300,120 0,120" fill="var(--leaf)" opacity="0.1" stroke="none"/>
                  <circle cx="300" cy="16" r="5" fill="var(--leaf)"/>
                </svg>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color:'var(--muted)', marginTop:'6px' }}><span>Month 1</span><span>Month 3</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* UNDER THE HOOD */}
        <section style={{ position:'relative', zIndex:10, background:'var(--surface)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', marginTop:'clamp(40px, 7vh, 80px)' }}>
          <div style={{ maxWidth:'1180px', margin:'0 auto', padding:'clamp(56px, 10vh, 110px) clamp(20px, 5vw, 60px)' }}>
            <div data-reveal style={{ maxWidth:'62ch', marginBottom:'clamp(40px, 6vh, 60px)' }}>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'16px' }}>Under the hood</div>
              <h2 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(28px, 3.8vw, 48px)', lineHeight:1.04, letterSpacing:'-0.025em', margin:0 }}>For the people who ask <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>&ldquo;but how does it really work?&rdquo;</span></h2>
            </div>
            <div className="hw-uh">
              {uhCards.map(c => (
                <div key={c.n} data-reveal style={{ background:'var(--bg)', border:'1px solid var(--line)', borderRadius:'16px', padding:'24px' }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--terra)', marginBottom:'12px' }}>{c.n}</div>
                  <h3 style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'19px', margin:'0 0 10px' }}>{c.title}</h3>
                  <p style={{ fontSize:'14.5px', lineHeight:1.6, color:'var(--muted)', margin:0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section style={{ position:'relative', zIndex:10, maxWidth:'1180px', margin:'0 auto', padding:'clamp(64px, 13vh, 150px) clamp(20px, 5vw, 60px)', textAlign:'center' }}>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)" style={{ position:'absolute', left:'12%', top:'22%', animation:'hw-twinkle 3.6s ease-in-out infinite' }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <h2 data-reveal style={{ fontFamily:"'General Sans'", fontWeight:600, fontSize:'clamp(36px, 6vw, 84px)', lineHeight:1.0, letterSpacing:'-0.035em', margin:'0 auto', maxWidth:'16ch' }}>Generation is easy. <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontWeight:400, color:'var(--sig)' }}>Judgment isn&apos;t.</span></h2>
          <div data-reveal style={{ display:'flex', flexWrap:'wrap', gap:'14px', justifyContent:'center', marginTop:'38px' }}>
            <a href="/auth/signup" style={{ textDecoration:'none', color:'var(--onSig)', background:'var(--sig)', fontWeight:600, fontSize:'17px', padding:'16px 30px', borderRadius:'999px', display:'inline-flex', alignItems:'center', gap:'9px' }}>Build your brand <span>↗</span></a>
            <a href="/gallery" data-seework style={{ textDecoration:'none', color:'var(--ink)', fontWeight:600, fontSize:'17px', padding:'16px 8px', display:'inline-flex', alignItems:'center', gap:'8px' }}>See the gallery <span style={{ color:'var(--terra)' }}>↓</span></a>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </div>
  );
}
