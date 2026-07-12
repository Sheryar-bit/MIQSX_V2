'use client';
import { useEffect } from 'react';

export function useMagnetic() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...document.querySelectorAll('[data-magnetic]')] as HTMLElement[];
    const onMove = (el: HTMLElement) => (ev: Event) => {
      const e = ev as MouseEvent;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.22}px,${y * 0.32}px)`;
    };
    const onLeave = (el: HTMLElement) => () => { el.style.transform = 'translate(0,0)'; };
    const cleanups = els.map(el => {
      const move = onMove(el);
      const leave = onLeave(el);
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
    });
    return () => cleanups.forEach(fn => fn());
  }, []);
}
