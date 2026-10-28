/* Penina · chat reader. Runs only in the browser: opens a WhatsApp export (.txt or .zip), parses it,
   computes the statistics and prepares the short excerpt that goes to the report writer.
   © Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';

  /* ---------- zip: just enough to pull _chat.txt out of a WhatsApp export ---------- */
  async function readZip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('zip');
    const count = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true);
    const files = [];
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
      files.push({ name, method, csize, local });
      p += 46 + nlen + xlen + clen;
    }
    const txt = files.filter((f) => /\.txt$/i.test(f.name) && !/__MACOSX/.test(f.name));
    const f = txt.find((x) => /_chat\.txt$/i.test(x.name)) || txt.sort((a, b) => b.csize - a.csize)[0];
    if (!f) throw new Error('no txt');
    const start = f.local + 30 + dv.getUint16(f.local + 26, true) + dv.getUint16(f.local + 28, true);
    const data = u8.subarray(start, start + f.csize);
    if (f.method === 0) return new TextDecoder().decode(data);
    if (f.method !== 8) throw new Error('zip method');
    const ds = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(ds).text();
  }

  async function readFile(file) {
    const buf = await file.arrayBuffer();
    const head = new Uint8Array(buf, 0, 4);
    if (head[0] === 0x50 && head[1] === 0x4b) return readZip(buf);
    return new TextDecoder().decode(buf);
  }

  /* ---------- parse ---------- */
  const INVIS = /[‎‏‪-‮⁦-⁩﻿]/g;
  const IOS = /^\[(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?\s?[Mm]\.?)?\]\s+([\s\S]+)$/;
  const AND = /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?\s?[Mm]\.?)?\s+[-–]\s+([\s\S]+)$/;
  const MEDIA = /(omitted|הושמט|לא נכלל|<attached:|‏?<.+>$|\.(jpg|jpeg|png|webp|opus|mp4|pdf) \(file attached\)|קובץ מצורף)/i;
  const DELETED = /^(this message was deleted|you deleted this message|ההודעה נמחקה|מחקת את ההודעה הזו|تم حذف هذه الرسالة|данное сообщение удалено|se eliminó este mensaje|ce message a été supprimé)\.?$/i;

  function parse(text) {
    const lines = text.replace(/\r\n?/g, '\n').replace(/[  ]/g, ' ').split('\n');
    const raw = [];
    for (let line of lines) {
      line = line.replace(INVIS, '');
      const m = line.match(IOS) || line.match(AND);
      if (m) {
        const rest = m[8]; const c = rest.indexOf(': ');
        // a name never has a line break and rarely passes 40 chars; anything else is a system line
        if (c > 0 && c < 60) raw.push({ d: [m[1], m[2], m[3]], h: +m[4], mi: +m[5], s: +(m[6] || 0), ap: m[7], who: rest.slice(0, c).trim(), text: rest.slice(c + 2) });
        else raw.push({ d: [m[1], m[2], m[3]], h: +m[4], mi: +m[5], s: +(m[6] || 0), ap: m[7], who: null, text: rest });
      } else if (raw.length && line) raw[raw.length - 1].text += '\n' + line;
    }
    // day/month order: Israel exports are day-first; switch only when the data says so
    let dmy = true, ymd = false;
    for (const r of raw) { if (+r.d[0] > 31) ymd = true; if (+r.d[1] > 12) dmy = false; }
    const msgs = [];
    for (const r of raw) {
      if (!r.who) continue;
      let [a, b, c] = r.d.map(Number); let y, mo, da;
      if (ymd) { y = a; mo = b; da = c; } else if (dmy) { da = a; mo = b; y = c; } else { mo = a; da = b; y = c; }
      if (y < 100) y += 2000;
      let h = r.h; if (r.ap) { const pm = /p/i.test(r.ap); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
      const t = new Date(y, mo - 1, da, h, r.mi, r.s).getTime();
      if (isNaN(t)) continue;
      const text = r.text.trim();
      msgs.push({ t, who: r.who, text, media: MEDIA.test(text), deleted: DELETED.test(text) });
    }
    msgs.sort((a, b) => a.t - b.t);
    return msgs;
  }

  /* ---------- statistics ---------- */
  const EMOJI = /\p{Extended_Pictographic}(‍\p{Extended_Pictographic})*/gu;
  const LAUGH = /(ח{3,}|חחח|haha|hahaha|lol|lmao|xd|😂|🤣|ههه|ахах|хаха|jaja|mdr)/i;
  const SORRY = /(סליחה|סורי|מצטער|מצטערת|sorry|my bad|آسف|прости|извини|perdón|lo siento|désolé)/i;
  const LOVE = /(אוהב|אוהבת|❤️|❤|😍|🥰|love you|ily|أحبك|люблю|te quiero|je t'aime|t'aime)/i;
  const QUESTION = /\?\s*$|^(מה|למה|מתי|איפה|מי|איך|כמה|what|why|when|where|who|how)\b/i;
  const STOP = new Set(('את של על עם זה זו גם לא כן אני אתה את הוא היא אנחנו הם הן יש אין אבל או אם כי מה מי לי לך לו לה לנו שלי שלך שלו שלה רק עוד כל כבר אז פה שם היה הייתי יהיה טוב אוקי אוקיי סבבה ok okay the a an and or but to of in on for is it i you he she we they me my your that this was be are not no yes so just what with at have do like').split(' '));

  function stats(msgs) {
    const people = {}; const P = (n) => people[n] || (people[n] = { name: n, msgs: 0, words: 0, chars: 0, media: 0, deleted: 0, starts: 0, replies: [], night: 0, laughs: 0, sorry: 0, love: 0, questions: 0, doubles: 0, emojis: {}, vocab: {}, ignored: 0 });
    const hours = new Array(24).fill(0), weekdays = new Array(7).fill(0), days = new Set();
    const GAP = 6 * 3600e3; let prev = null, runStart = null;
    const allVocab = {};
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i], p = P(m.who), dt = new Date(m.t);
      p.msgs++; hours[dt.getHours()]++; weekdays[dt.getDay()]++; days.add(dt.toDateString());
      if (dt.getHours() < 5) p.night++;
      if (m.media) p.media++; if (m.deleted) p.deleted++;
      if (!m.media && !m.deleted) {
        const w = m.text.split(/\s+/).filter(Boolean); p.words += w.length; p.chars += m.text.length;
        if (LAUGH.test(m.text)) p.laughs++; if (SORRY.test(m.text)) p.sorry++; if (LOVE.test(m.text)) p.love++; if (QUESTION.test(m.text)) p.questions++;
        for (const e of m.text.match(EMOJI) || []) p.emojis[e] = (p.emojis[e] || 0) + 1;
        for (let x of w) { x = x.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''); if (x.length < 3 || STOP.has(x) || /\d{3}/.test(x) || LAUGH.test(x)) continue; p.vocab[x] = (p.vocab[x] || 0) + 1; allVocab[x] = (allVocab[x] || 0) + 1; }
      }
      if (!prev || m.t - prev.t > GAP) {
        p.starts++;
        // the opener of the previous conversation got no answer from anyone else
        if (runStart != null && !msgs.slice(runStart, i).some((x) => x.who !== msgs[runStart].who)) P(msgs[runStart].who).ignored++;
        runStart = i;
      } else if (prev.who !== m.who) p.replies.push(m.t - prev.t);
      else if (m.t - prev.t > 20 * 60e3) p.doubles++; // wrote again after 20 minutes of silence
      prev = m;
    }
    const total = msgs.length;
    const list = Object.values(people).sort((a, b) => b.msgs - a.msgs);
    const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    // signature words: used a lot by this person, relatively little by the others
    const signature = (p) => Object.entries(p.vocab).filter(([w, c]) => c >= 3).map(([w, c]) => [w, c / (allVocab[w] || 1) * Math.log(1 + c)]).sort((a, b) => b[1] - a[1]).slice(0, 6).map((x) => x[0]);
    let streak = 0, best = 0, last = null;
    for (const d of [...days].map((s) => new Date(s).getTime()).sort((a, b) => a - b)) { streak = last && d - last <= 36 * 3600e3 ? streak + 1 : 1; best = Math.max(best, streak); last = d; }
    const span = total ? msgs[total - 1].t - msgs[0].t : 0;
    return {
      total, from: total ? msgs[0].t : null, to: total ? msgs[total - 1].t : null, activeDays: days.size, spanDays: Math.round(span / 864e5) + 1, bestStreakDays: best,
      busiestHour: hours.indexOf(Math.max(...hours)), hours, weekdays,
      people: list.map((p) => ({
        name: p.name, msgs: p.msgs, share: +(p.msgs / total * 100).toFixed(1), avgWords: p.msgs ? +(p.words / Math.max(1, p.msgs - p.media - p.deleted)).toFixed(1) : 0,
        media: p.media, deleted: p.deleted, starts: p.starts, startedNoAnswer: p.ignored,
        medianReplyMin: median(p.replies) == null ? null : +(median(p.replies) / 60e3).toFixed(1),
        nightPct: +(p.night / p.msgs * 100).toFixed(1), laughs: p.laughs, sorry: p.sorry, love: p.love, questions: p.questions, doubleTexts: p.doubles,
        topEmojis: Object.entries(p.emojis).sort((a, b) => b[1] - a[1]).slice(0, 5).map((x) => x[0]),
        signatureWords: signature(p),
      })),
    };
  }

  /* ---------- excerpt for the writer: whole conversations spread across the history, private details masked ---------- */
  const mask = (s) => s.replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '[email]').replace(/https?:\/\/\S+/g, '[link]').replace(/(\+?\d[\d\s-]{7,}\d)/g, '[phone]').replace(/\b\d{9}\b/g, '[id]');
  function excerpt(msgs, budget = 110000) {
    const useful = msgs.filter((m) => !m.deleted);
    const win = 45, slots = Math.max(1, Math.floor(budget / (win * 70)));
    const out = []; const step = Math.max(win, Math.floor(useful.length / slots));
    const pad = (n) => String(n).padStart(2, '0');
    for (let s = 0; s < useful.length && out.join('\n').length < budget; s += step) {
      out.push('…');
      for (const m of useful.slice(s, s + win)) {
        const d = new Date(m.t);
        const body = m.media ? '[media]' : mask(m.text).replace(/\n+/g, ' / ').slice(0, 220);
        out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} | ${m.who}: ${body}`);
      }
    }
    return out.join('\n').slice(0, budget);
  }

  root.PeninaChat = { readFile, parse, stats, excerpt, readZip };
})(typeof window !== 'undefined' ? window : globalThis);
