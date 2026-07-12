'use client';
import { useEffect } from 'react';

export function useTilt() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...document.querySelectorAll('[data-tilt]')] as HTMLElement[];
    const onMove = (el: HTMLElement) => (ev: Event) => {
      const e = ev as MouseEvent;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
    };
    const onLeave = (el: HTMLElement) => () => { el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)'; };
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
