'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Dict } from '../lib/i18n';

export type AppInfo = { id: 'pk' | 'cx'; name: string; path: string; color: string; ink: string };
type Tab = 'iphone' | 'android' | 'computer';

function guessTab(): Tab {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iphone';
  if (/android/i.test(ua)) return 'android';
  return 'computer';
}

export default function InstallSheet({ app, d, onClose }: { app: AppInfo | null; d: Dict; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('computer');
  const [qr, setQr] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const url = app ? `https://barusik.com${app.path}` : '';

  useEffect(() => { if (app) setTab(guessTab()); }, [app]);
  useEffect(() => {
    if (!app) return;
    QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#090B1F', light: '#00000000' } }).then(setQr).catch(() => setQr(''));
  }, [app, url]);
  useEffect(() => {
    if (!app) return;
    const prev = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) { // keep focus inside the dialog
        const f = [...panel.current.querySelectorAll<HTMLElement>('a,button')].filter((x) => !x.hasAttribute('disabled'));
        if (!f.length) return; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', key);
    setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-first]')?.focus(), 50);
    return () => { removeEventListener('keydown', key); prev?.focus?.(); };
  }, [app, onClose]);

  const steps = tab === 'iphone' ? d.stepsIphone : tab === 'android' ? d.stepsAndroid : d.stepsComputer;
  return (
    <AnimatePresence>
      {app ? (
        <motion.div key="scrim" className="fixed inset-0 z-[80] flex items-end justify-center bg-night/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-label={`${d.install} · ${app.name}`}
            className="glass relative w-full max-w-lg overflow-hidden rounded-t-[28px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[28px]"
            initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: app.color }} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-mist">{d.howInstall}</p>
                <h2 className="mt-1 text-2xl font-extrabold">{app.name}</h2>
              </div>
              <button type="button" onClick={onClose} aria-label={d.close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div role="tablist" className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-night/50 p-1">
              {(['iphone', 'android', 'computer'] as Tab[]).map((t) => (
                <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
                  className="relative h-11 rounded-xl text-sm font-bold">
                  {tab === t ? <motion.span layoutId="tabpill" className="absolute inset-0 rounded-xl" style={{ background: app.color }} transition={{ type: 'spring', stiffness: 400, damping: 34 }} /> : null}
                  <span className="relative" style={{ color: tab === t ? app.ink : undefined }}>{d[t]}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <ol className="space-y-3" role="tabpanel">
                <AnimatePresence mode="popLayout" initial={false}>
                  {steps.map((s, i) => (
                    <motion.li key={tab + i} className="flex items-center gap-3 text-[15px]"
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }} exit={{ opacity: 0 }}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold" style={{ background: app.color, color: app.ink }}>{i + 1}</span>
                      {s}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
              {qr ? (
                <figure className="hidden flex-col items-center gap-2 sm:flex">
                  <div className="h-32 w-32 rounded-2xl bg-paper p-3" dangerouslySetInnerHTML={{ __html: qr }} aria-hidden />
                  <figcaption className="text-xs text-mist">{d.scanQr}</figcaption>
                </figure>
              ) : null}
            </div>

            <a data-first href={app.path} className="mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-extrabold transition-transform active:scale-[.98]"
              style={{ background: app.color, color: app.ink }}>
              {d.open}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="rtl:-scale-x-100"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </a>
            <p className="mt-3 text-center text-[13px] text-mist">{d.updatesNote}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
