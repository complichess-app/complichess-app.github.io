'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { CONTACT, LANGS, LANG_NAMES, RTL, type Dict, type Lang } from '../lib/i18n';
import { world, type PlatformId } from '../lib/store';
import { Cursor, LangSwitch, MagneticButton, MagneticLink, Words } from './ui';
import InstallSheet, { type AppInfo } from './InstallSheet';
import Account from './Account';
import A11yMenu from './A11yMenu';
import { prefersStill, A11Y_T } from '../lib/a11y';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

const APPS: Record<'pk' | 'cx', Omit<AppInfo, 'name'>> = {
  pk: { id: 'pk', path: '/platformika/', color: '#6A63FF', ink: '#FFFFFF' },
  cx: { id: 'cx', path: '/complichess/', color: '#D8AE57', ink: '#1A1208' },
};
const ACCENT: Record<PlatformId, string> = { tr: '#38BDF8', pk: '#6A63FF', cx: '#D8AE57', cr: '#49E8C8', lr: '#FF7A59' };
const IDS: PlatformId[] = ['tr', 'pk', 'cx', 'cr', 'lr'];
const TRAVEL = { site: '/travel/', wa: 'https://wa.me/972556630709' };
/* titles shrink to fit their box: the longest word decides (in container-width units) */
const fitTitle = (name: string, k = 0.64) => { const n = Math.max(...name.split(/\s+/).map((w) => [...w].length)); return `${(100 / (n * k)).toFixed(2)}cqw`; };

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M6 9.5 16 5l10 4.5L16 14Z" fill="#6A63FF" />
      <path d="M6 16 16 11.5 26 16 16 20.5Z" fill="#D8AE57" opacity=".95" />
      <path d="M6 22.5 16 18l10 4.5L16 27Z" fill="none" stroke="#49E8C8" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

/* BARUSIK in a variable font: each letter's weight follows the pointer (or a slow wave on touch screens). */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const letters = [...el.querySelectorAll<HTMLSpanElement>('[data-l]')];
    if (prefersStill()) { letters.forEach((l) => (l.style.fontVariationSettings = "'wght' 900")); return; }
    let px = -1, raf = 0, last = 0;
    const fine = matchMedia('(pointer: fine)').matches;
    const move = (e: PointerEvent) => { px = e.clientX; last = performance.now(); };
    const loop = (t: number) => {
      const idle = !fine || px < 0 || t - last > 2500;
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect(); const cx = r.left + r.width / 2;
        const w = idle ? 560 + 340 * Math.sin(t / 900 - i * 0.7) : 200 + 700 * Math.exp(-Math.pow((px - cx) / (r.width * 1.6), 2));
        const cur = parseFloat(l.dataset.w || '900'); const nw = cur + (w - cur) * 0.12;
        l.dataset.w = String(nw); l.style.fontVariationSettings = `'wght' ${nw.toFixed(0)}`;
      });
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', move); raf = requestAnimationFrame(loop);
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} dir="ltr" aria-hidden className="wordmark select-none whitespace-nowrap text-center font-display leading-[.78] tracking-[-.04em] text-paper"
      style={{ fontSize: 'clamp(64px, 19.5vw, 300px)' }}>
      {'BARUSIK'.split('').map((c, i) => (
        <span key={i} className="word"><span data-l style={{ fontVariationSettings: "'wght' 900" }}>{c}</span></span>
      ))}
    </div>
  );
}

function Chapter({ id, index, d, data, live, onInstall }: { id: PlatformId; index: number; d: Dict; data: Dict['pk']; live: boolean; onInstall?: () => void }) {
  const accent = ACCENT[id];
  return (
    <section id={`ch-${id}`} data-chapter={index} className="chapter relative h-[175svh]">
      <div className="sticky top-0 flex h-[100svh] items-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:items-center md:px-[6vw] md:pb-0">
        <div className="panel glass w-full max-w-[31rem] rounded-[28px] p-6 md:p-9" style={{ ['--acc' as string]: accent, containerType: 'inline-size' }}>
          <div className="reveal flex items-center gap-3 text-sm">
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 font-bold" style={{ background: `${accent}22`, color: accent }}>
              <span className={`h-2 w-2 rounded-full ${live ? 'animate-pulse' : ''}`} style={{ background: accent }} />{live ? d.live : d.soon}
            </span>
            <span dir="ltr" className="font-display text-xs font-medium tracking-wide text-mist">{data.tag}</span>
          </div>
          <h2 className="mt-4 font-black leading-[.95] tracking-tight" style={{ fontSize: `clamp(30px, min(7.4vw, ${fitTitle(data.name)}), 104px)` }}><Words text={data.name} /></h2>
          <p className="reveal mt-5 max-w-[34ch] text-[17px] leading-relaxed text-paper/85 md:text-lg">{data.desc}</p>
          <ul className="reveal mt-5 hidden space-y-2 text-[15px] text-paper/80 md:block">
            {data.points.map((p, i) => (
              <li key={i} className="flex items-center gap-3"><span className="h-2.5 w-2.5 rotate-45 rounded-[3px]" style={{ background: accent, opacity: 1 - i * 0.22 }} />{p}</li>
            ))}
          </ul>
          <div className="reveal mt-7 flex flex-wrap items-center gap-3">
            {id === 'tr' ? (<>
              <MagneticLink href={TRAVEL.site} className="relative flex h-14 items-center gap-2 rounded-full px-7 text-base font-extrabold shadow-[0_10px_40px_-10px_var(--acc)]" >
                <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: accent }} />
                <span className="relative flex items-center gap-2 text-night">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M2 16l20-8-6 12-3-5-5-2z" /></svg>{d.trVisit}
                </span>
              </MagneticLink>
              <a href={TRAVEL.wa} target="_blank" rel="noopener" className="flex h-14 items-center gap-2 rounded-full border border-white/15 px-5 text-base font-bold text-paper/90 hover:bg-white/5 hover:text-paper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.1z" /></svg>{d.trWa}
              </a>
            </>) : live && onInstall ? (<>
              <MagneticButton onClick={onInstall} className="relative flex h-14 items-center gap-2 rounded-full px-7 text-base font-extrabold shadow-[0_10px_40px_-10px_var(--acc)]">
                <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: accent }} />
                <span className="relative flex items-center gap-2" style={{ color: id === 'cx' ? '#1A1208' : '#fff' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>{d.install}
                </span>
              </MagneticButton>
              <a href={APPS[id as 'pk' | 'cx'].path} className="group flex h-14 items-center gap-2 rounded-full px-5 text-base font-bold text-paper/90 hover:text-paper">
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_2px]">{d.open}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="rtl:-scale-x-100"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>
            </>) : (
              <span className="flex h-14 items-center gap-3 rounded-full border px-6 text-base font-bold" style={{ borderColor: `${accent}66`, color: accent }}>
                <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ping rounded-full" style={{ background: accent }} /><span className="relative h-2.5 w-2.5 rounded-full" style={{ background: accent }} /></span>
                {d.soon}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AppCard({ id, d, data, live, onInstall }: { id: PlatformId; d: Dict; data: Dict['pk']; live: boolean; onInstall?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const accent = ACCENT[id];
  const tilt = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType !== 'mouse' || world.reduced) return;
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(0)`;
    el.style.setProperty('--mx', `${(x + 0.5) * 100}%`); el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };
  return (
    <div ref={ref} onPointerMove={tilt} onPointerLeave={() => { if (ref.current) ref.current.style.transform = ''; }}
      className="card group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-deep/80 p-7"
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '0%', containerType: 'inline-size' }}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(420px circle at var(--mx) var(--my), ${accent}2e, transparent 60%)` }} />
      <div className="relative flex items-center justify-between">
        <span dir="ltr" className="truncate font-display text-xs font-medium tracking-wide text-mist">{data.tag.length > 24 ? data.name : data.tag}</span>
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${accent}22`, color: accent }}>{live ? d.live : d.soon}</span>
      </div>
      <h3 className="relative mt-10 font-black leading-[1.05] tracking-tight" style={{ fontSize: `min(36px, ${fitTitle(data.name, 0.66)})` }}>{data.name}</h3>
      <p className="relative mt-3 flex-1 text-[15px] leading-relaxed text-paper/75">{data.desc}</p>
      <div className="relative mt-8 flex flex-wrap gap-2">
        {id === 'tr' ? (<>
          <a href={TRAVEL.site} data-cursor="grow" className="flex h-12 items-center rounded-full px-6 text-[15px] font-extrabold text-night transition-transform active:scale-95" style={{ background: accent }}>{d.trVisit}</a>
          <a href={TRAVEL.wa} target="_blank" rel="noopener" className="flex h-12 items-center rounded-full border border-white/15 px-5 text-[15px] font-bold hover:bg-white/5">{d.trWa}</a>
        </>) : live && onInstall ? (<>
          <button type="button" onClick={onInstall} data-cursor="grow" className="h-12 rounded-full px-6 text-[15px] font-extrabold transition-transform active:scale-95" style={{ background: accent, color: id === 'cx' ? '#1A1208' : '#fff' }}>{d.install}</button>
          <a href={APPS[id as 'pk' | 'cx'].path} className="flex h-12 items-center rounded-full border border-white/15 px-5 text-[15px] font-bold hover:bg-white/5">{d.open}</a>
        </>) : (<span className="flex h-12 items-center rounded-full border px-6 text-[15px] font-bold" style={{ borderColor: `${accent}55`, color: accent }}>{d.soon}</span>)}
      </div>
      <div className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rotate-45 rounded-[28px] opacity-20 transition-transform duration-700 ease-out-expo group-hover:translate-y-2 group-hover:rotate-[60deg]" style={{ background: accent }} />
    </div>
  );
}

export default function Site({ lang, d }: { lang: Lang; d: Dict }) {
  const rtl = RTL[lang];
  const [gl, setGl] = useState<boolean | null>(null);
  const [sheet, setSheet] = useState<'pk' | 'cx' | null>(null);
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const cursorLabels = useMemo(() => ({ tr: d.tr.name, pk: d.pk.name, cx: d.cx.name, cr: d.soon, lr: `${d.lr.name} · ${d.soon}`, drag: d.drag }), [d]);

  const scrollToY = useCallback((y: number) => {
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: world.reduced ? 'auto' : 'smooth' });
  }, []);
  const toChapter = useCallback((i: number) => {
    const el = document.querySelectorAll<HTMLElement>('[data-chapter]')[i]; if (!el) return;
    scrollToY(el.offsetTop + (el.offsetHeight - innerHeight) / 2);
  }, [scrollToY]);
  const toId = useCallback((id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id); if (!el) return; e.preventDefault(); scrollToY(el.offsetTop);
  }, [scrollToY]);

  // leaving for another language: a curtain grows from the click, then the new page reveals itself
  const goLang = useCallback((l: Lang, e: React.MouseEvent) => {
    try { localStorage.setItem('barusik.lang', l); } catch {}
    const c = curtain.current;
    if (!c || world.reduced) { location.href = `/${l}/`; return; }
    const x = e.clientX || innerWidth / 2, y = e.clientY || 80;
    c.style.display = 'block';
    c.animate([{ clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)` }], { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })
      .onfinish = () => { location.href = `/${l}/`; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('barusik.lang', lang); } catch {}
    world.rtl = rtl;
    world.reduced = prefersStill();
    const setMobile = () => { world.mobile = innerWidth < 768; };
    setMobile(); addEventListener('resize', setMobile);
    setGl(hasWebGL());
    world.onPick = (id) => toChapter(IDS.indexOf(id));

    gsap.registerPlugin(ScrollTrigger);
    let lenis: Lenis | null = null;
    const raf = (t: number) => lenis?.raf(t * 1000);
    if (!world.reduced) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    }

    // scroll → story progress (0 overview, 1 travel … 5 LearnLume, 6 gone)
    let anchors: number[] = [];
    const measure = () => {
      const ch = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
      const install = document.getElementById('install');
      anchors = [0, ...ch.map((el) => el.offsetTop + (el.offsetHeight - innerHeight) / 2), install ? install.offsetTop : document.body.scrollHeight];
    };
    measure(); addEventListener('resize', measure);
    let lastActive = -1;
    const tick = () => {
      const y = window.scrollY; let p = 0;
      for (let i = 0; i < anchors.length - 1; i++) { if (y >= anchors[i]) p = i + Math.min(1, (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i])); }
      world.progress = p;
      const a = p < 0.5 ? 0 : Math.min(IDS.length, Math.round(p)); if (a !== lastActive) { lastActive = a; setActive(a); }
      if (canvasWrap.current) canvasWrap.current.style.opacity = String(Math.max(0, Math.min(1, 1 - (p - (IDS.length + 0.35)) * 1.6)));
      setScrolled(y > 40);
    };
    gsap.ticker.add(tick);

    // a mouse press on empty space (aiming for a 3D part and missing) must not start selecting text across the page
    const noSelect = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const t = e.target as Element | null;
      if (!t || t.closest('input,textarea,select,[contenteditable],p,h1,h2,h3,h4,li,label,code,a,button,.panel,.card,footer')) return;
      e.preventDefault();
    };
    addEventListener('mousedown', noSelect);
    const pm = (e: PointerEvent) => { world.pointer.x = (e.clientX / innerWidth) * 2 - 1; world.pointer.y = -((e.clientY / innerHeight) * 2 - 1); };
    addEventListener('pointermove', pm);

    // choreography
    const ctx = gsap.context(() => {
      if (world.reduced) return;
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro.from('.wordmark .word > span', { yPercent: 105, duration: 1.4, stagger: 0.06 }, 0.15)
        .from('.hero-title .word > span', { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.45)
        .from('.hero-fade', { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, 0.7)
        .from('.canvas-wrap', { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0.2);
      gsap.to('.wordmark', { yPercent: 35, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-top', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.chapter').forEach((ch) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 55%', end: 'bottom 45%', toggleActions: 'play reverse play reverse' } });
        tl.from(ch.querySelectorAll('.word > span'), { yPercent: 115, rotate: rtl ? -4 : 4, duration: 1, stagger: 0.06, ease: 'expo.out' }, 0)
          .from(ch.querySelectorAll('.reveal'), { opacity: 0, y: 26, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.1);
        gsap.fromTo(ch.querySelector('.panel'), { opacity: 1 }, { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: ch, start: 'bottom 85%', end: 'bottom 35%', scrub: true } });
      });
      gsap.fromTo('#install .card', { y: 80, opacity: 0, rotateX: -12, transformOrigin: '50% 100%' }, { y: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#install .grid', start: 'top 85%', end: 'bottom 10%', toggleActions: 'play reverse play reverse' } });
      gsap.from('#install .install-title .word > span', { yPercent: 110, duration: 1.1, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: '#install', start: 'top 75%' } });
      gsap.from('.contact-mail', { clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '#contact', start: 'top 80%' } });
    });

    return () => {
      ctx.revert(); gsap.ticker.remove(tick); gsap.ticker.remove(raf); lenis?.destroy(); lenisRef.current = null;
      removeEventListener('resize', setMobile); removeEventListener('resize', measure); removeEventListener('pointermove', pm); removeEventListener('mousedown', noSelect);
      world.onPick = null;
    };
  }, [lang, rtl, toChapter]);

  useEffect(() => { if (sheet) lenisRef.current?.stop(); else lenisRef.current?.start(); }, [sheet]);

  const appInfo: AppInfo | null = sheet ? { ...APPS[sheet], name: sheet === 'pk' ? d.pk.name : d.cx.name } : null;
  const navItems = [d.tr.name, d.pk.name, d.cx.name, d.cr.name, d.lr.name];

  return (
    <>
      <a href="#platforms" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-night">{d.skip}</a>

      {/* background: deep night with three colored glows; the 3D scene floats on top of it */}
      <div aria-hidden className="fixed inset-0 -z-10" style={{ background: 'radial-gradient(80vw 60vh at 15% 10%, #2A238F55, transparent 60%), radial-gradient(70vw 60vh at 90% 50%, #D8AE5726, transparent 60%), radial-gradient(70vw 50vh at 30% 100%, #49E8C81f, transparent 60%), #090B1F' }} />
      <div ref={canvasWrap} className="canvas-wrap fixed inset-0 z-0">
        {gl ? <Scene /> : gl === false ? (
          <div aria-hidden className="absolute inset-0 grid place-items-center">
            <div className="relative h-72 w-72 [transform:rotateX(60deg)_rotateZ(45deg)]">
              <div className="absolute inset-0 rounded-3xl bg-pk/70" /><div className="absolute inset-0 translate-x-10 translate-y-10 rounded-3xl bg-brass/60" /><div className="absolute inset-0 translate-x-20 translate-y-20 rounded-3xl border-2 border-mint" />
            </div>
          </div>
        ) : null}
      </div>

      <header className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter] duration-500 ${scrolled ? 'bg-night/55 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex h-[72px] items-center justify-between gap-4 px-5 pt-[env(safe-area-inset-top)] md:px-[4vw]">
          <a href={`/${lang}/`} className="flex items-center gap-2.5" aria-label={d.brand} onClick={toId('hero')}>
            <Mark size={30} />
            <span dir="ltr" className="font-display text-lg font-black tracking-tight">BARUSIK</span>
          </a>
          <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex" aria-label={d.nav.platforms}>
            {[['platforms', d.nav.platforms], ['install', d.nav.install], ['contact', d.nav.contact]].map(([id, t]) => (
              <a key={id} href={`#${id}`} onClick={toId(id)} className="rounded-full px-4 py-2 text-paper/80 transition-colors hover:bg-white/10 hover:text-paper">{t}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2"><Account d={d} lang={lang} /><LangSwitch lang={lang} label={d.nav.lang} onGo={goLang} /></div>
        </div>
      </header>

      {/* story index: which platform is in front */}
      <nav aria-label={d.nav.platforms} className={`fixed end-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 md:flex ${active >= 1 && active <= IDS.length ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {navItems.map((n, i) => (
          <button key={i} type="button" onClick={() => toChapter(i)} aria-current={active === i + 1 ? 'true' : undefined}
            className="group flex items-center justify-end gap-3 text-sm font-bold">
            <span className={`transition-all duration-500 ${active === i + 1 ? 'opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70 rtl:-translate-x-2'}`}>{n}</span>
            <span className="h-2.5 rounded-full transition-all duration-500 ease-out-expo" style={{ width: active === i + 1 ? 28 : 10, background: active === i + 1 ? ACCENT[IDS[i]] : '#A3A5CB66' }} />
          </button>
        ))}
      </nav>

      <main className="relative z-10">
        <section id="hero" className="relative flex h-[100svh] min-h-[560px] flex-col justify-between overflow-hidden pt-[96px]">
          <div className="hero-top px-5 md:px-[4vw]">
            <p className="hero-fade flex items-center gap-2 text-sm font-medium text-mist"><Mark size={16} />{d.count}</p>
            <h1 className="hero-title mt-4 max-w-[14ch] font-black leading-[.95] tracking-tight" style={{ fontSize: 'clamp(40px, 6.2vw, 92px)' }}><Words text={d.heroTitle} /></h1>
            <p className="hero-fade mt-5 max-w-[42ch] text-[17px] leading-relaxed text-paper/80 md:text-lg">{d.heroSub}</p>
            <p className="hero-fade drag-hint mt-3 hidden items-center gap-2 text-sm text-mist [@media(pointer:fine)]:flex">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-2a1.5 1.5 0 0 1 3 0V12M14 10.5a1.5 1.5 0 0 1 3 0V12M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15a1.5 1.5 0 0 1 2.5-1.7L8 15" /></svg>{d.drag}
            </p>
            <div className="hero-fade mt-7 flex flex-wrap gap-2">
              {IDS.map((id, i) => (
                <button key={id} type="button" onClick={() => toChapter(i)} data-cursor="grow"
                  className="glass flex h-11 items-center gap-2 rounded-full ps-3 pe-4 text-[15px] font-bold transition-colors hover:bg-white/10">
                  <span className="h-2.5 w-2.5 rotate-45 rounded-[3px]" style={{ background: ACCENT[id] }} />{navItems[i]}
                  {id === 'cr' || id === 'lr' ? <span className="text-xs font-medium text-mist">· {d.soon}</span> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Wordmark />
            <button type="button" onClick={() => toChapter(0)} className="hero-fade absolute bottom-[12%] end-5 hidden items-center gap-3 text-sm font-medium text-paper/70 md:flex md:end-[calc(4vw+5rem)]">
              {d.scroll}
              <span className="relative h-10 w-6 rounded-full border border-paper/40"><span className="absolute start-1/2 top-2 h-2 w-1 -translate-x-1/2 animate-bounce rounded-full bg-paper rtl:translate-x-1/2" /></span>
            </button>
          </div>
        </section>

        <div id="platforms">
          <Chapter id="tr" index={0} d={d} data={d.tr} live />
          <Chapter id="pk" index={1} d={d} data={d.pk} live onInstall={() => setSheet('pk')} />
          <Chapter id="cx" index={2} d={d} data={d.cx} live onInstall={() => setSheet('cx')} />
          <Chapter id="cr" index={3} d={d} data={d.cr} live={false} />
          <Chapter id="lr" index={4} d={d} data={d.lr} live={false} />
        </div>

        <section id="install" className="relative px-5 pb-24 pt-32 md:px-[4vw]" style={{ background: 'linear-gradient(to bottom, transparent, #090B1F 22%)' }}>
          <div className="mx-auto max-w-6xl">
            <h2 className="install-title max-w-[16ch] font-black leading-[.98] tracking-tight" style={{ fontSize: 'clamp(38px, 5.4vw, 76px)' }}><Words text={d.installTitle} /></h2>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-paper/75">{d.installSub}</p>
            <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3" style={{ perspective: '1200px' }}>
              <AppCard id="tr" d={d} data={d.tr} live />
              <AppCard id="pk" d={d} data={d.pk} live onInstall={() => setSheet('pk')} />
              <AppCard id="cx" d={d} data={d.cx} live onInstall={() => setSheet('cx')} />
              <AppCard id="cr" d={d} data={d.cr} live={false} />
              <AppCard id="lr" d={d} data={d.lr} live={false} />
            </div>
            <p className="mt-6 text-[15px] text-mist">{d.updatesNote}</p>
          </div>
        </section>

        <footer id="contact" className="relative overflow-hidden bg-night px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 md:px-[4vw]">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black md:text-5xl">{d.contactTitle}</h2>
            <p className="mt-3 max-w-[48ch] text-lg text-paper/70">{d.contactSub}</p>
            <MagneticLink href={`mailto:${CONTACT}`} className="contact-mail mt-10 inline-block max-w-full whitespace-nowrap font-display font-bold tracking-tight text-paper decoration-gold decoration-[3px] underline-offset-8 hover:underline" >
              <span dir="ltr" style={{ fontSize: 'clamp(15px, calc((min(100vw, 1240px) - 56px) / 15.5), 60px)' }}>{CONTACT}</span>
            </MagneticLink>
            <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-mist md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3"><Mark size={22} /><span>© {new Date().getFullYear()} Barusik · {d.rights}</span><a href={`/${lang}/accessibility/`} className="underline underline-offset-4 hover:text-paper">{A11Y_T[lang].statement}</a></div>
              <nav aria-label={d.nav.lang} className="flex flex-wrap gap-x-4 gap-y-2">
                {LANGS.map((l) => (<a key={l} href={`/${l}/`} lang={l} onClick={(e) => { e.preventDefault(); goLang(l, e); }} className={l === lang ? 'text-paper' : 'hover:text-paper'}>{LANG_NAMES[l]}</a>))}
              </nav>
            </div>
          </div>
        </footer>
      </main>

      <InstallSheet app={appInfo} d={d} onClose={() => setSheet(null)} />
      <Cursor labels={cursorLabels} />
      <A11yMenu lang={lang} />
      <div ref={curtain} aria-hidden className="fixed inset-0 z-[95] hidden" style={{ background: 'linear-gradient(135deg, #6A63FF, #2A238F)' }} />
      <div aria-hidden className="page-in pointer-events-none fixed inset-0 z-[94]" style={{ background: 'linear-gradient(135deg, #6A63FF, #2A238F)' }} />
    </>
  );
}
