'use client';
/* Floating accessibility button + panel. Settings are saved per browser and applied on every page. */
import { useEffect, useRef, useState } from 'react';
import { A11Y_T, applyA11y, readA11y, writeA11y, type A11yKey, type A11yState } from '../lib/a11y';
import type { Lang } from '../lib/i18n';

const ICONS: Record<A11yKey, string> = {
  big: 'M4 18 9 6l5 12M5.6 14h6.8M15 18l3-7 3 7M15.8 16h4.4',
  bigger: 'M3 19 9 5l6 14M4.8 14.5h8.4M16 10h6M19 7v6',
  contrast: 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18',
  still: 'M8 6v12M16 6v12',
  links: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1M4 21h16',
  font: 'M5 20 10 4h1l5 16M7 14h7M18 20v-6a2 2 0 0 1 4 0v6',
  cursor: 'M5 3l14 7-6 2-2 6z',
  gray: 'M12 3a6 6 0 0 1 6 6c0 4-6 12-6 12S6 13 6 9a6 6 0 0 1 6-6z',
  focus: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 12h6',
};
const ORDER: A11yKey[] = ['big', 'bigger', 'contrast', 'still', 'links', 'font', 'cursor', 'gray', 'focus'];
const RELOAD: A11yKey[] = ['still', 'cursor', 'contrast']; // these change how the 3D scene and cursor start up

export default function A11yMenu({ lang }: { lang: Lang }) {
  const t = A11Y_T[lang];
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<A11yState>({});
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => { const v = readA11y(); setS(v); applyA11y(v); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape' && open) { setOpen(false); btn.current?.focus(); }
      if (e.key === 'Tab' && open && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('button,a')]; if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    addEventListener('keydown', k);
    if (open) setTimeout(() => panel.current?.querySelector<HTMLElement>('button')?.focus(), 30);
    return () => removeEventListener('keydown', k);
  }, [open]);

  const toggle = (k: A11yKey) => {
    const n: A11yState = { ...s, [k]: !s[k] };
    if (k === 'big' && n.big) n.bigger = false;
    if (k === 'bigger' && n.bigger) n.big = false;
    setS(n); writeA11y(n);
    if (RELOAD.includes(k)) setTimeout(() => location.reload(), 150);
  };
  const reset = () => { const changed = RELOAD.some((k) => s[k]); setS({}); writeA11y({}); if (changed) setTimeout(() => location.reload(), 150); };
  const on = Object.values(s).some(Boolean);

  return (
    <>
      <button ref={btn} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="a11y-panel"
        aria-label={t.open + ' (Alt+A)'} title={t.open + ' (Alt+A)'}
        className="a11y-fab fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-[90] grid h-14 w-14 place-items-center rounded-full shadow-[0_8px_30px_-6px_rgba(0,0,0,.6)] outline-offset-4"
        style={{ background: '#1D6FE8', color: '#fff' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="12" cy="4.2" r="2.1" /><path d="M5 7.6c2.4.7 4.5 1 7 1s4.6-.3 7-1l.5 1.9c-1.9.6-3.6.9-5.4 1.1V13l2.6 7.4-1.9.7L12.4 15h-.8l-2.4 6.1-1.9-.7L9.9 13v-2.4C8.1 10.4 6.4 10.1 4.5 9.5z" /></svg>
        {on ? <span aria-hidden className="absolute -top-0.5 -end-0.5 h-3.5 w-3.5 rounded-full border-2 border-night bg-gold" /> : null}
      </button>
      {open ? (
        <div id="a11y-panel" ref={panel} role="dialog" aria-modal="false" aria-label={t.title}
          className="a11y-panel fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.5rem)] end-4 z-[90] max-h-[min(78svh,640px)] w-[min(92vw,360px)] overflow-y-auto rounded-3xl border border-white/15 p-4 shadow-2xl"
          style={{ background: '#0E1230', color: '#fff' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">{t.title}</h2>
            <button type="button" onClick={() => { setOpen(false); btn.current?.focus(); }} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label={t.close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ORDER.map((k) => (
              <button key={k} type="button" aria-pressed={!!s[k]} onClick={() => toggle(k)}
                className={`flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-[14px] font-bold leading-tight transition-colors ${s[k] ? 'border-[#5AA2FF] bg-[#1D6FE8] text-white' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICONS[k]} /></svg>
                {t[k]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={reset} className="h-11 rounded-full border border-white/20 font-bold hover:bg-white/10">{t.reset}</button>
            <a href={`/${lang}/accessibility/`} className="flex h-11 items-center justify-center rounded-full font-bold text-[#9CC8FF] underline underline-offset-4">{t.statement}</a>
          </div>
        </div>
      ) : null}
    </>
  );
}
