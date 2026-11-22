/* Thinking Farm · © 2026 Bar Lvovski. All rights reserved.
   Music and sounds, all made live with Web Audio (no files to download). The music is a slow mysterious loop that
   brightens as the player gets closer and picks up a pulse while a topic question's clock runs. Nothing plays until
   the first tap or key press, as browsers require. Settings: tf.music / tf.sfx in localStorage. */
(() => {
  'use strict';
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master, musicBus, sfxBus, verb, echo, echoFb, padFilter;
  let musicOn = get('tf.music', true), sfxOn = get('tf.sfx', true);
  let heat = 0, clockOn = false, clockLeft = 99, timer = 0, nextT = 0, step = 0, started = false;

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  // D minor with a touch of Phrygian: four chords, ten seconds each
  const CHORDS = [[50, 57, 62, 64, 65], [46, 53, 58, 62, 69], [43, 50, 55, 58, 62], [45, 52, 57, 62, 64]];
  const BELLS = [62, 64, 65, 69, 72, 74, 76, 77, 81, 84];

  function impulse(sec, decay) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }
  function init() {
    if (ctx || !AC) return !!ctx;
    try { ctx = new AC(); } catch { return false; }
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.6);
    const vg = ctx.createGain(); vg.gain.value = 0.45; verb.connect(vg).connect(master);
    echo = ctx.createDelay(1.5); echo.delayTime.value = 0.47;
    echoFb = ctx.createGain(); echoFb.gain.value = 0.38;
    const eg = ctx.createGain(); eg.gain.value = 0.5;
    echo.connect(echoFb).connect(echo); echo.connect(eg).connect(master); eg.connect(verb);
    padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 700; padFilter.Q.value = 0.7;
    padFilter.connect(musicBus); padFilter.connect(verb);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (musicOn || sfxOn) ctx.resume(); });
    return true;
  }
  function unlock() {
    if (!init()) return;
    if (ctx.state !== 'running') ctx.resume();
    if (!started) { started = true; nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 40); setMusic(musicOn); }
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));

  /* ---------------------------------------------------------------- building blocks */
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function bell(freq, t, vol, dest, dur = 1.6, wet = true) {
    const o = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; m.type = 'sine'; m.frequency.value = freq * 3.01; mg.gain.value = freq * 0.9;
    mg.gain.setValueAtTime(freq * 1.2, t); mg.gain.exponentialRampToValueAtTime(1, t + dur * 0.7);
    m.connect(mg).connect(o.frequency); o.connect(g); g.connect(dest); if (wet) g.connect(echo);
    env(g, t, 0.005, vol, dur);
    o.start(t); m.start(t); o.stop(t + dur + 0.1); m.stop(t + dur + 0.1);
  }
  function tone(freq, t, vol, dur, type = 'sine', dest = sfxBus, glide = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    o.connect(g).connect(dest); env(g, t, 0.01, vol, dur); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, from, to, vol, dest = sfxBus) {
    const n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain(); n.connect(f).connect(g).connect(dest); g.connect(verb); env(g, t, dur * 0.4, vol, dur * 0.6); n.start(t); n.stop(t + dur);
  }
  function pad(notes, t, dur) {
    for (const n of notes) for (const det of [-6, 6]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = n < 52 ? 'triangle' : 'sawtooth'; o.frequency.value = midi(n); o.detune.value = det;
      o.connect(g).connect(padFilter);
      const v = n < 52 ? 0.06 : 0.018;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 2.2);
      g.gain.setValueAtTime(v, t + dur - 1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 2.5);
      o.start(t); o.stop(t + dur + 2.6);
    }
    const sub = ctx.createOscillator(), sg = ctx.createGain(); sub.frequency.value = midi(notes[0] - 12);
    sub.connect(sg).connect(musicBus); sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.09, t + 1.5);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.5); sub.start(t); sub.stop(t + dur + 1.6);
  }

  /* ---------------------------------------------------------------- the music: 8th notes, chord every 32 */
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const bpm = clockOn ? (clockLeft <= 10 ? 150 : 112) : 84, eighth = 30 / bpm;
    while (nextT < ctx.currentTime + 0.25) {
      const t = nextT, ch = CHORDS[Math.floor(step / 32) % CHORDS.length];
      if (musicOn) {
        if (step % 32 === 0) pad(ch, t, 32 * (30 / 84));
        const p = 0.16 + heat * 0.45 + (clockOn ? 0.15 : 0);
        if (Math.random() < p) {
          const pool = BELLS.filter((n) => ch.some((c) => (n - c) % 12 === 0) || Math.random() < 0.25);
          bell(midi(pool[Math.floor(Math.random() * pool.length)] + (heat > 0.7 && Math.random() < 0.4 ? 12 : 0)), t, 0.035 + heat * 0.03, musicBus, 1.8);
        }
        if (clockOn && step % 2 === 0) {           // the pulse of a running clock
          tone(step % 8 === 0 ? 70 : 55, t, 0.16, 0.18, 'sine', musicBus, 38);
          if (clockLeft <= 10) noise(t, 0.05, 6000, 9000, 0.05, musicBus);
        }
      }
      nextT += eighth; step++;
    }
    padFilter.frequency.setTargetAtTime(500 + heat * 2600 + (clockOn ? 500 : 0), ctx.currentTime, 0.8);
  }
  function setMusic(on) {
    musicOn = on; put('tf.music', on);
    if (!ctx) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, on ? 1.2 : 0.3);
    if (on && ctx.state !== 'running') ctx.resume();
  }
  function setSfx(on) { sfxOn = on; put('tf.sfx', on); if (on) unlock(); }

  /* ---------------------------------------------------------------- sounds */
  const SFX = {
    good(s = 10) {                        // a right answer: more notes and higher for a rarer one
      const t = ctx.currentTime, n = 1 + Math.min(4, Math.floor(s / 22)), base = s >= 80 ? 76 : s >= 55 ? 72 : s >= 30 ? 69 : 65;
      const steps = [0, 4, 7, 12, 16];
      for (let i = 0; i < n; i++) bell(midi(base + steps[i]), t + i * 0.07, 0.16, sfxBus, 1.2);
      if (s >= 80) { for (let i = 0; i < 7; i++) bell(midi(88 + [0, 3, 7, 10, 12, 15, 19][i]), t + 0.3 + i * 0.045, 0.05, sfxBus, 0.8); noise(t + 0.2, 0.9, 2000, 12000, 0.06); }
    },
    fix(s) { const t = ctx.currentTime; tone(520, t, 0.07, 0.12, 'triangle', sfxBus, 780); setTimeout(() => SFX.good(s), 110); },
    bad() { const t = ctx.currentTime; tone(196, t, 0.14, 0.16, 'triangle', sfxBus, 160); tone(147, t + 0.13, 0.14, 0.25, 'triangle', sfxBus, 110); },
    dup() { tone(900, ctx.currentTime, 0.06, 0.06, 'square'); },
    tick(left) { const t = ctx.currentTime; tone(left <= 3 ? 1760 : 1320, t, left <= 5 ? 0.12 : 0.07, 0.07, 'sine'); },
    start() { const t = ctx.currentTime; noise(t, 0.7, 250, 4000, 0.12); tone(220, t, 0.08, 0.7, 'sine', sfxBus, 880); bell(midi(74), t + 0.62, 0.14, sfxBus, 1.5); },
    timeup() {
      const t = ctx.currentTime;
      for (const [r, v] of [[1, 0.22], [2.76, 0.09], [5.4, 0.05], [8.93, 0.03]]) tone(98 * r, t, v, 3.2, 'sine');
      tone(49, t, 0.2, 2.2, 'sine', sfxBus, 40); noise(t, 1.2, 1200, 300, 0.05);
    },
    near(s) {                              // a secret-word guess: the closer, the higher
      const t = ctx.currentTime;
      if (s == null) { tone(180, t, 0.07, 0.2, 'triangle', sfxBus, 150); return; }
      const n = 55 + Math.round((s / 99) * 30);
      bell(midi(n), t, 0.13, sfxBus, 1.1);
      if (s >= 75) bell(midi(n + 7), t + 0.09, 0.09, sfxBus, 1.1);
      if (s >= 90) bell(midi(n + 12), t + 0.18, 0.08, sfxBus, 1.2);
    },
    solve() {
      const t = ctx.currentTime; noise(t, 1.4, 300, 9000, 0.12);
      [62, 66, 69, 74, 78, 81, 86].forEach((n, i) => bell(midi(n), t + 0.1 + i * 0.08, 0.15, sfxBus, 2));
      for (const n of [50, 57, 62, 66]) tone(midi(n), t + 0.1, 0.05, 2.6, 'sawtooth');
    },
    give() { const t = ctx.currentTime; tone(440, t, 0.1, 1.1, 'triangle', sfxBus, 110); noise(t, 1, 3000, 200, 0.05); },
    hint() { const t = ctx.currentTime; [81, 86, 88].forEach((n, i) => bell(midi(n), t + i * 0.09, 0.08, sfxBus, 1)); },
    nav() { tone(660, ctx.currentTime, 0.03, 0.05, 'sine'); },
    finale(n = 0) {
      const t = ctx.currentTime, prog = [[62, 66, 69], [59, 62, 67], [64, 67, 71], [62, 66, 69, 74]];
      prog.forEach((c, i) => c.forEach((m) => { bell(midi(m + 12), t + i * 0.42, 0.11, sfxBus, 1.6); tone(midi(m), t + i * 0.42, 0.04, 0.6, 'sawtooth'); }));
      for (let i = 0; i < Math.min(10, n) + 4; i++) bell(midi(86 + (i * 5) % 12), t + 1.8 + i * 0.06, 0.05, sfxBus, 1);
    },
  };

  window.TFS = {
    unlock,
    play(name, arg) { if (!sfxOn || !init() || ctx.state !== 'running' || !SFX[name]) return; try { SFX[name](arg); } catch {} },
    heat(h) { heat = Math.max(0, Math.min(1, +h || 0)); },
    clock(on, left = 99) { clockOn = !!on; clockLeft = left; },
    get music() { return musicOn; }, set music(v) { setMusic(!!v); if (v) unlock(); },
    get sfx() { return sfxOn; }, set sfx(v) { setSfx(!!v); },
    get any() { return musicOn || sfxOn; },
  };
})();
