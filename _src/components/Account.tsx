'use client';
/* One Barusik account for every platform. Same Supabase project and the same saved session
   ('complichess-auth' on barusik.com) as Complichess and Platformika, so signing in here signs you in there too. */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Dict, Lang } from '../lib/i18n';

const SB_URL = 'https://iktmyrfbejtjsiehcrar.supabase.co';
const SB_KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
type SB = any; // supabase-js client, loaded from /lib/supabase.js
type User = { id: string; email?: string; user_metadata?: { username?: string } };

let client: SB | null = null;
function loadClient(): Promise<SB | null> {
  if (client) return Promise.resolve(client);
  return new Promise((res) => {
    const make = () => {
      const g = (window as any).supabase;
      if (!g) return res(null);
      client = g.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'complichess-auth' } });
      res(client);
    };
    if ((window as any).supabase) return make();
    const s = document.createElement('script'); s.src = '/lib/supabase.js'; s.async = true;
    s.onload = make; s.onerror = () => res(null); document.head.appendChild(s);
  });
}

export default function Account({ d, lang }: { d: Dict; lang: Lang }) {
  const a = d.acc;
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [admin, setAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sb, setSb] = useState<SB | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const f = useRef({ email: '', pass: '', user: '' });

  useEffect(() => {
    let off: (() => void) | null = null;
    loadClient().then((c) => {
      if (!c) return; setSb(c);
      const r = c.auth.onAuthStateChange((_e: string, session: { user: User } | null) => setUser(session ? session.user : null));
      off = () => r.data.subscription.unsubscribe();
    });
    return () => { off?.(); };
  }, []);
  useEffect(() => {
    if (!sb || !user) { setName(''); setAdmin(false); return; }
    sb.from('profiles').select('username').eq('id', user.id).maybeSingle().then((r: any) => setName(r?.data?.username || user.user_metadata?.username || ''));
    sb.rpc('is_admin').then((r: any) => setAdmin(r?.data === true)).catch(() => setAdmin(false));
  }, [sb, user]);
  // Penina requests waiting for Bar's approval (admin only): a number on the account button and the admin link
  const [pn, setPn] = useState(0);
  useEffect(() => {
    if (!sb || !admin) { setPn(0); return; }
    const tick = () => { if (document.hidden) return; sb.rpc('pn_pending_count').then((r: any) => setPn(Number(r?.data) || 0)).catch(() => setPn(0)); };
    tick(); const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [sb, admin]);
  // Travel server light (admin only): green when Bar's computer answers customers, red when not.
  const [srv, setSrv] = useState<boolean | null>(null);
  useEffect(() => {
    if (!sb || !admin) return;
    const tick = () => sb.rpc('travel_status').then((r: any) => setSrv(!!r?.data?.online)).catch(() => setSrv(false));
    tick(); const t = setInterval(tick, 8000);
    return () => clearInterval(t);
  }, [sb, admin]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', k);
    setTimeout(() => panel.current?.querySelector<HTMLElement>('input,button')?.focus(), 60);
    return () => removeEventListener('keydown', k);
  }, [open, tab, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!sb) return;
    const { email, pass } = f.current; const uname = f.current.user.trim();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg(a.badMail);
    if (pass.length < 6 || (tab === 'signup' && (uname.length < 2 || uname.length > 20))) return setMsg(a.short);
    setBusy(true); setMsg('');
    try {
      if (tab === 'signup') {
        const { data: free } = await sb.rpc('username_available', { p_name: uname });
        if (free === false) { setMsg(a.taken); return; }
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pass, options: { data: { username: uname }, emailRedirectTo: `https://barusik.com/${lang}/` } });
        if (error) throw error;
        if (!data.session) { setMsg(a.check); return; }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) throw error;
      }
      setOpen(false);
    } catch (x: any) {
      const m = String(x?.message || '').toLowerCase();
      setMsg(m.includes('invalid login') ? a.bad : x?.message || 'Error');
    } finally { setBusy(false); }
  };
  const forgot = async () => {
    if (!sb) return; const email = f.current.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg(a.badMail);
    await sb.auth.resetPasswordForEmail(email, { redirectTo: `https://barusik.com/${lang}/` }); setMsg(a.sent);
  };

  const initial = (name || user?.email || '?').trim().charAt(0).toUpperCase();
  const field = 'h-12 w-full rounded-2xl border border-white/10 bg-night/60 px-4 text-[16px] text-paper outline-none focus:border-pk';
  return (
    <>
      {admin ? (
        <button type="button" data-cursor="grow" onClick={() => window.open('/admin/server/', 'bt-server', 'popup,width=560,height=760')}
          title={srv ? 'שרת הנסיעות פועל — הלקוחות יכולים לחפש' : 'שרת הנסיעות כבוי — לחץ להפעלה'}
          className="glass flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold">
          <span aria-hidden className="relative inline-block h-3 w-3 rounded-full" style={{ background: srv ? '#22C55E' : '#EF4444', boxShadow: srv ? '0 0 10px #22C55E' : '0 0 10px #EF4444' }} />
          <span>{srv ? 'שרת פועל' : 'הפעל שרת'}</span>
        </button>
      ) : null}
      <button type="button" onClick={() => { setMsg(''); setOpen(true); }} data-cursor="grow" aria-haspopup="dialog"
        className="glass relative flex h-11 items-center gap-2 rounded-full ps-1.5 pe-4 text-sm font-bold">
        {pn > 0 ? <span aria-label={`${pn}`} className="absolute -top-1 -start-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#F0507F] px-1 text-[11px] font-black text-white">{pn}</span> : null}
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full font-display text-[13px] font-black" style={{ background: user ? 'linear-gradient(135deg,#6A63FF,#D8AE57)' : 'rgba(255,255,255,.08)' }}>
          {user ? initial : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>}
        </span>
        <span className="hidden sm:inline">{user ? (name || a.yours) : a.login}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-[80] grid place-items-end bg-night/70 backdrop-blur-sm md:place-items-center" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div ref={panel} role="dialog" aria-modal="true" aria-label={user ? a.yours : a.login} onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md rounded-t-[28px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:rounded-[28px]"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}>
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full font-display text-lg font-black" style={{ background: 'linear-gradient(135deg,#6A63FF,#D8AE57)' }}>{initial}</span>
                    <div className="min-w-0"><div className="text-sm text-mist">{a.hi}</div><div className="truncate text-lg font-extrabold">{name || user.email}</div><div dir="ltr" className="truncate text-start text-xs text-mist">{user.email}</div></div>
                  </div>
                  <div className="text-sm font-bold text-mist">{a.yours}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <a href="/platformika/" className="rounded-2xl border border-white/10 px-4 py-3 font-bold hover:bg-white/5"><span className="me-2 inline-block h-2.5 w-2.5 rotate-45 rounded-[3px] bg-pk" />{d.pk.name}</a>
                    <a href="/complichess/" className="rounded-2xl border border-white/10 px-4 py-3 font-bold hover:bg-white/5"><span className="me-2 inline-block h-2.5 w-2.5 rotate-45 rounded-[3px] bg-brass" />{d.cx.name}</a>
                  </div>
                  {admin ? <a href={pn > 0 ? '/admin/#penina' : '/admin/'} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gold font-extrabold text-night">{a.admin}{pn > 0 ? <span className="rounded-full bg-night px-2 text-sm text-gold">{pn}</span> : null}</a> : null}
                  <button type="button" onClick={async () => { await sb?.auth.signOut(); setOpen(false); }} className="h-12 rounded-full border border-white/15 font-bold hover:bg-white/5">{a.logout}</button>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
                  <div className="flex gap-1 rounded-full bg-night/50 p-1" role="tablist">
                    {(['login', 'signup'] as const).map((t) => (
                      <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setMsg(''); }}
                        className={`h-10 flex-1 rounded-full text-sm font-bold transition-colors ${tab === t ? 'bg-paper text-night' : 'text-mist'}`}>{t === 'login' ? a.login : a.signup}</button>
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-paper/75">{a.one}</p>
                  {tab === 'signup' ? <label className="flex flex-col gap-1 text-sm font-bold">{a.username}<input dir="ltr" autoComplete="username" maxLength={20} className={field} onChange={(e) => { f.current.user = e.target.value; }} /></label> : null}
                  <label className="flex flex-col gap-1 text-sm font-bold">{a.email}<input type="email" dir="ltr" autoComplete="email" className={field} onChange={(e) => { f.current.email = e.target.value; }} /></label>
                  <label className="flex flex-col gap-1 text-sm font-bold">{a.password}<input type="password" dir="ltr" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} className={field} onChange={(e) => { f.current.pass = e.target.value; }} /></label>
                  {msg ? <p role="alert" className="text-sm font-bold text-gold">{msg}</p> : null}
                  <button type="submit" disabled={busy || !sb} className="h-12 rounded-full bg-pk font-extrabold text-white disabled:opacity-60">{busy ? a.busy : tab === 'login' ? a.login : a.signup}</button>
                  {tab === 'login' ? <button type="button" onClick={forgot} className="self-center text-sm text-mist underline-offset-4 hover:underline">{a.forgot}</button> : null}
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
