'use client';
import { useEffect, useRef, useState } from 'react';
import { LANGS, LANG_NAMES, type Lang } from '../lib/i18n';
import { customCursorOff, prefersStill } from '../lib/a11y';

/* Words wrapped for a rise-in reveal. Splits on spaces only, so Arabic and Hebrew letters keep their shapes. */
export function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true"><span className="word"><span>{w}</span></span>{' '}</span>
      ))}
    </span>
  );
}

/* Buttons that lean toward the pointer. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!matchMedia('(pointer: fine)').matches || prefersStill()) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`; if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(loop); else raf = 0; };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); tx = (e.clientX - (r.left + r.width / 2)) * strength; ty = (e.clientY - (r.top + r.height / 2)) * strength; kick(); };
    const leave = () => { tx = 0; ty = 0; kick(); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, [strength]);
  return ref;
}

export function MagneticLink({ href, className, children, onClick, label, external, download }: { href: string; className?: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; label?: string; external?: boolean; download?: boolean }) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return <a ref={ref} href={href} className={className} onClick={onClick} aria-label={label} data-cursor="grow" download={download || undefined} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>{children}</a>;
}
export function MagneticButton({ className, children, onClick, label, disabled }: { className?: string; children: React.ReactNode; onClick?: () => void; label?: string; disabled?: boolean }) {
  const ref = useMagnetic<HTMLButtonElement>();
  return <button ref={ref} type="button" className={className} onClick={onClick} aria-label={label} disabled={disabled} data-cursor="grow">{children}</button>;
}

/* Custom cursor: a dot that sticks to the pointer and a ring that trails it. Grows on links,
   shows a label over the 3D platforms. Only with a mouse and when motion is allowed. */
export function Cursor({ labels }: { labels: Record<string, string> }) {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null), lab = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || customCursorOff()) return;
    setOn(true); document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, s = 1, raf = 0, seen = false, frame = 0, glow = false;
    /* the cursor is drawn with a "difference" blend, which disappears over mid-tone colours (gold, light buttons…).
       Look at the colour under it and switch to an orange glow only there. */
    const rgb = (c: string) => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
    const lum = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const PAPER = [238, 234, 248];
    const hardToSee = (el: Element | null) => {
      let bg = [9, 11, 31];
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const c = rgb(getComputedStyle(n).backgroundColor); const a = c.length > 3 ? c[3] : 1;
        if (a > 0.35) { bg = c; break; }
      }
      const seenAs = bg.slice(0, 3).map((v, i) => Math.abs(PAPER[i] - v));
      const L1 = lum(seenAs), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      return ratio < 3;
    };
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; if (!seen) { seen = true; rx = x; ry = y; } };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      const ds = document.documentElement.dataset;
      const dragging = !!ds.drag, grab = !!ds.grab;
      const hov = dragging ? undefined : ds.hover;
      const t = document.elementFromPoint(x, y) as HTMLElement | null;
      if (++frame % 6 === 0) { const g2 = hardToSee(t); if (g2 !== glow) { glow = g2; ring.current?.classList.toggle('cur-glow', glow); dot.current?.classList.toggle('cur-glow', glow); } }
      const grow = !!t?.closest('a,button,[data-cursor]');
      const target = dragging ? 0.75 : hov ? 3.2 : grow ? 1.9 : 1;
      s += (target - s) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current) { ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`; ring.current.style.opacity = seen ? '1' : '0'; }
      if (lab.current) { lab.current.textContent = hov ? (grab ? `${labels[hov] || ''} · ✋` : labels[hov] || '') : ''; lab.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`; lab.current.style.opacity = hov ? '1' : '0'; }
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', move); raf = requestAnimationFrame(loop);
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); document.documentElement.classList.remove('has-cursor'); };
  }, [labels]);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300]">
      <div ref={ring} className="absolute left-0 top-0 h-9 w-9 rounded-full border border-paper/60 opacity-0 mix-blend-difference" style={{ transition: 'opacity .3s' }} />
      <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-paper mix-blend-difference" />
      <span ref={lab} className="absolute left-0 top-0 whitespace-nowrap text-[11px] font-bold tracking-wide text-night opacity-0" style={{ transition: 'opacity .2s' }} />
    </div>
  );
}

/* Language menu. Leaving runs the curtain transition, then loads the other language's page. */
export function LangSwitch({ lang, label, onGo }: { lang: Lang; label: string; onGo: (l: Lang, e: React.MouseEvent) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', off); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', off); removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}
        className="glass flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
        {LANG_NAMES[lang]}
      </button>
      <div role="menu" className={`glass absolute end-0 top-13 w-44 origin-top rounded-2xl p-1.5 transition duration-300 ease-out-expo ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
        {LANGS.map((l) => (
          <a key={l} role="menuitem" href={`/${l}/`} lang={l} aria-current={l === lang ? 'true' : undefined} tabIndex={open ? 0 : -1}
            onClick={(e) => { e.preventDefault(); setOpen(false); onGo(l, e); }}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] hover:bg-white/10 ${l === lang ? 'text-gold' : ''}`}>
            {LANG_NAMES[l]}{l === lang ? <span aria-hidden>●</span> : null}
          </a>
        ))}
      </div>
    </div>
  );
}
