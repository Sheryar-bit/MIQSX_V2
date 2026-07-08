'use client';
import { useState } from 'react';
import { SP } from './Sparkle';

const FAQ_DATA = [
  { q: 'Can I use generated assets commercially?', a: 'Yes. Everything MIQSX produces from your Brand DNA is yours to use across client work, ads, and social — on Pro and Agency with no extra licensing.' },
  { q: 'Which languages does MIQSX speak?', a: 'English, Urdu, and Roman Urdu out of the box. Captions and copy are generated natively in all three, with a cultural check so nothing lands wrong.' },
  { q: 'How big a team can I add?', a: 'Free is solo. Pro covers up to 3 seats. Agency is built for studios — unlimited reviewers and client approval over WhatsApp.' },
  { q: 'What are the limits on the free tier?', a: 'One Brand DNA, 30 generated assets a month, and the full Guardian scoring so you can feel the workflow before you commit.' },
  { q: 'Does the brand really learn from feedback?', a: 'Every approval and rejection is logged against your Brand DNA. Over time the system internalises your taste and the off-brand suggestions stop appearing.' },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" style={{ padding: 'clamp(56px, 9vh, 110px) clamp(20px, 5vw, 60px)', maxWidth: '1180px', margin: '0 auto', borderTop: '1px solid var(--line)' }}>
      <div className="mqsx-faq">
        <div data-reveal style={{ position: 'sticky', top: '110px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '19px', color: 'var(--terra)', marginBottom: '14px' }}><svg width="14" height="14" viewBox="0 0 40 40" fill="var(--terra)"><SP /></svg> FAQ</div>
          <h2 style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(30px, 4.4vw, 52px)', lineHeight: 1.04, letterSpacing: '-0.03em', margin: 0 }}>Questions,<br /><span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 500 }}>answered.</span></h2>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: '17px', lineHeight: 1.55, color: 'var(--dim)', margin: '18px 0 0', maxWidth: '30ch' }}>Still unsure? Reach us on WhatsApp and a human replies same-day.</p>
        </div>
        <div data-reveal data-reveal-delay="80" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_DATA.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i} style={{ borderRadius: '16px', border: `1px solid ${open ? 'var(--border)' : 'var(--line)'}`, background: open ? 'var(--card)' : 'transparent', overflow: 'hidden', transition: 'background .3s, border-color .3s' }}>
                <button onClick={() => setOpenFaq(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: 'clamp(15.5px, 1.9vw, 17.5px)', fontWeight: 600 }}>
                  <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '18px', color: 'var(--terra)', flex: '0 0 auto' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>{faq.q}</span>
                  <span style={{ flex: '0 0 auto', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '22px', color: 'var(--terra)', fontWeight: 500, lineHeight: 1 }}>{open ? '−' : '+'}</span>
                </button>
                <div style={{ overflow: 'hidden', transition: 'max-height .45s cubic-bezier(.2,.7,.2,1), opacity .35s ease', maxHeight: open ? '260px' : '0px', opacity: open ? 1 : 0 }}>
                  <p style={{ margin: 0, padding: '0 22px 22px 60px', fontSize: '15px', lineHeight: 1.6, color: 'var(--dim)', maxWidth: '60ch' }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
