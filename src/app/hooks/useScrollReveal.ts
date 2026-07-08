'use client';
import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const E = 'cubic-bezier(.2,.7,.2,1)';
    const els = [...document.querySelectorAll('[data-reveal]')] as HTMLElement[];
    els.forEach(el => {
      const d = el.getAttribute('data-reveal-delay') || '0';
      el.style.opacity = '0'; el.style.transform = 'translateY(26px)'; el.style.filter = 'blur(8px)';
      el.style.transition = `opacity .9s ${E} ${d}ms, transform .9s ${E} ${d}ms, filter .9s ease ${d}ms`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
