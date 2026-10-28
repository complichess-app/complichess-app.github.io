// © 2026 Bar Lvovski. All rights reserved.
// Penina: reads a WhatsApp chat (stats + a sampled excerpt prepared in the browser) and writes a report.
// Nothing about the chat is stored or logged. One free report per account per day (pn_take_report).
// Secrets: ANTHROPIC_API_KEY. SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-sonnet-5-5';
const ORIGINS = ['https://barusik.com', 'https://www.barusik.com', 'http://localhost:8091'];
const LANG_NAME: Record<string, string> = { he: 'Hebrew', en: 'English', ar: 'Arabic', ru: 'Russian', es: 'Spanish', fr: 'French' };

const cors = (o: string | null) => ({
  'Access-Control-Allow-Origin': o && ORIGINS.includes(o) ? o : ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const PERSONA = `You are Penina — a sharp, warm, very funny Israeli woman in her sixties who has read every message in this group chat and now tells the people in it what she really thinks. You talk like a person, not like a product: short sentences, specific details, punchlines that land because they are true. You roast with love. You notice who carries the conversation, who disappears, who only shows up to send memes, who apologises too much, who never asks a question back.

How you write:
- Every claim comes from the chat: a number from the stats, a habit you saw, a line someone actually wrote. Never invent quotes. Quotes are copied exactly from the excerpt and kept short (under 12 words).
- Be blunt and specific. No hedging, no "it seems", no "as an AI", no disclaimers, no therapy-speak, no motivational-poster lines.
- Funny first, then one honest, genuinely kind observation per person — the thing a good friend would say.
- Roast behaviour, never who people are: no jokes about looks, bodies, religion, ethnicity, sexuality, illness or money troubles. If the chat touches something painful (grief, illness, a breakup), treat that part gently and do not joke about it.
- People are named exactly as they appear in the chat.
- Write the whole report in the requested language, in natural everyday register (for Hebrew: spoken Israeli Hebrew, not translated English).`;

const TOOL = {
  name: 'report',
  description: 'The finished chat report.',
  input_schema: {
    type: 'object',
    required: ['headline', 'verdict', 'score', 'people', 'dynamics', 'moments', 'advice'],
    properties: {
      headline: { type: 'string', description: 'One line that sums up this chat. Max 12 words.' },
      verdict: { type: 'string', description: "Penina's opening paragraph about the chat as a whole, 3-5 sentences." },
      score: { type: 'integer', minimum: 1, maximum: 10, description: 'How healthy and fun this chat is, 1-10.' },
      score_line: { type: 'string', description: 'One sentence explaining the score.' },
      people: {
        type: 'array', maxItems: 12,
        items: {
          type: 'object', required: ['name', 'role', 'roast', 'kind', 'green', 'red'],
          properties: {
            name: { type: 'string' },
            role: { type: 'string', description: 'Their role in the chat in 2-5 words, e.g. "the one who plans and nobody comes".' },
            roast: { type: 'string', description: '2-3 sentences, specific, funny.' },
            kind: { type: 'string', description: 'One honest kind sentence.' },
            green: { type: 'string', description: 'A green flag, short.' },
            red: { type: 'string', description: 'A red flag, short.' },
          },
        },
      },
      dynamics: { type: 'array', maxItems: 5, items: { type: 'string' }, description: 'Observations about how the group works together, one sentence each.' },
      moments: {
        type: 'array', maxItems: 5,
        items: { type: 'object', required: ['quote', 'who', 'note'], properties: { quote: { type: 'string' }, who: { type: 'string' }, note: { type: 'string', description: "Penina's one-line comment." } } },
      },
      advice: { type: 'string', description: "What Penina would tell this chat, 2-3 sentences." },
    },
  },
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const h = { ...cors(origin), 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return new Response('{"error":"method"}', { status: 405, headers: h });

  const auth = req.headers.get('Authorization') ?? '';
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: who } = await sb.auth.getUser();
  if (!who?.user) return new Response('{"error":"sign in"}', { status: 401, headers: h });

  let body: { lang?: string; stats?: unknown; excerpt?: string; people?: string[] };
  try { body = await req.json(); } catch { return new Response('{"error":"bad json"}', { status: 400, headers: h }); }
  const lang = LANG_NAME[body.lang ?? 'he'] ? body.lang! : 'he';
  const excerpt = String(body.excerpt ?? '').slice(0, 160_000);
  const stats = JSON.stringify(body.stats ?? {}).slice(0, 40_000);
  if (excerpt.length < 200) return new Response('{"error":"too short"}', { status: 400, headers: h });

  const take = await sb.rpc('pn_take_report');
  if (take.error) {
    const limit = take.error.message.includes('daily limit');
    return new Response(JSON.stringify({ error: limit ? 'limit' : 'account' }), { status: limit ? 429 : 401, headers: h });
  }

  const refund = async () => {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.rpc('pn_refund', { p_uid: who.user!.id });
  };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 6000,
        system: PERSONA,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'report' },
        messages: [{
          role: 'user',
          content: `Language for the report: ${LANG_NAME[lang]}.\n\nStatistics computed over the whole chat (exact numbers — use them):\n${stats}\n\nChat excerpt (sampled across the whole history, oldest first, format "date time | name: message"):\n${excerpt}`,
        }],
      }),
    });
    if (!r.ok) throw new Error(`claude ${r.status}`);
    const j = await r.json();
    const out = j.content?.find((c: { type: string }) => c.type === 'tool_use')?.input;
    if (!out) throw new Error('no report');
    return new Response(JSON.stringify({ report: out, left: take.data?.left ?? 0 }), { headers: h });
  } catch (e) {
    await refund();
    console.error('penina failed', String(e).slice(0, 80)); // never log chat content
    return new Response('{"error":"busy"}', { status: 502, headers: h });
  }
});
