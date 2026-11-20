/* Barusik Poker · the players' characters: eight women drawn here as SVG, from the shoulders up, with a face
   that flinches when a tomato lands on it. avatarSVG(id) returns the markup; .hit on a parent closes her eyes.
   © 2026 Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';
  // skin, shade, hair, hair style, outfit, outfit colours, lips, eyes, earrings
  const LOOKS = [
    { name: 'Lola',   skin: '#F2C7A5', shade: '#D9A27F', hair: '#2B1A12', style: 'waves',    outfit: 'gown',    c1: '#C8102E', c2: '#8E0B20', lips: '#B3122E', eyes: '#4A2E1C', ear: 'hoop' },
    { name: 'Vera',   skin: '#F6D7C3', shade: '#E0B39A', hair: '#E9C46A', style: 'bob',      outfit: 'blazer',  c1: '#14141A', c2: '#2B2B36', lips: '#C2185B', eyes: '#2E6F95', ear: 'stud' },
    { name: 'Nadia',  skin: '#8D5A3B', shade: '#6E4229', hair: '#120C09', style: 'curls',    outfit: 'sequin',  c1: '#D4AF37', c2: '#9C7C1E', lips: '#7A1F2B', eyes: '#2A170D', ear: 'drop' },
    { name: 'Mei',    skin: '#F3D2B3', shade: '#DDB08C', hair: '#0E0E12', style: 'straight', outfit: 'satin',   c1: '#0F7B5F', c2: '#08513E', lips: '#C0392B', eyes: '#1F140C', ear: 'stud' },
    { name: 'Rosa',   skin: '#D9A07A', shade: '#BC8159', hair: '#5A2314', style: 'pony',     outfit: 'leather', c1: '#1B1B1F', c2: '#3A3A44', lips: '#A4243B', eyes: '#3B2414', ear: 'hoop' },
    { name: 'Dana',   skin: '#F5CDB4', shade: '#DFA98B', hair: '#B5482A', style: 'bun',      outfit: 'dealer',  c1: '#F4F1EA', c2: '#2A1F1A', lips: '#D0384F', eyes: '#3C6E47', ear: 'drop' },
    { name: 'Amara',  skin: '#6B4126', shade: '#53301B', hair: '#1A100B', style: 'braids',   outfit: 'gown',    c1: '#5B2A86', c2: '#3B1A59', lips: '#5E1A2A', eyes: '#1E120A', ear: 'hoop' },
    { name: 'Kira',   skin: '#F0C9AE', shade: '#D5A387', hair: '#C9C2D6', style: 'pixie',    outfit: 'jacket',  c1: '#E2366F', c2: '#A81F4F', lips: '#9C1C47', eyes: '#5A3D7A', ear: 'stud' },
  ];

  const hairBack = (l) => ({
    waves:    `<path d="M24 44c-4 22 2 46-6 60 12 4 22-2 28-10-6-14-4-34-2-48z M76 44c4 22-2 46 6 60-12 4-22-2-28-10 6-14 4-34 2-48z" fill="${l.hair}"/>`,
    bob:      `<path d="M27 40c-5 16-3 30 2 38 6 3 12 3 16 1-3-12-3-26-1-38z M73 40c5 16 3 30-2 38-6 3-12 3-16 1 3-12 3-26 1-38z" fill="${l.hair}"/>`,
    curls:    `<g fill="${l.hair}"><circle cx="26" cy="40" r="11"/><circle cx="74" cy="40" r="11"/><circle cx="22" cy="56" r="10"/><circle cx="78" cy="56" r="10"/><circle cx="25" cy="71" r="9"/><circle cx="75" cy="71" r="9"/><circle cx="31" cy="83" r="7"/><circle cx="69" cy="83" r="7"/></g>`,
    straight: `<path d="M28 38c-6 24-4 50-8 66h18c-2-20-2-44 0-62z M72 38c6 24 4 50 8 66H62c2-20 2-44 0-62z" fill="${l.hair}"/>`,
    pony:     `<path d="M68 26c16 4 20 24 14 44-3 10-1 20 4 28-12 0-18-12-16-26 2-14 4-30-2-46z" fill="${l.hair}"/>`,
    bun:      `<circle cx="50" cy="15" r="11" fill="${l.hair}"/>`,
    braids:   `<g fill="${l.hair}"><path d="M27 42c-5 20-4 44-2 62h9c-2-18-2-42 0-60z"/><path d="M73 42c5 20 4 44 2 62h-9c2-18 2-42 0-60z"/></g><g fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.4"><path d="M27 58l7 4M26 68l8 4M26 78l8 4M27 88l7 4M73 58l-7 4M74 68l-8 4M74 78l-8 4M73 88l-7 4"/></g>`,
    pixie:    '',
  }[l.style]);

  const hairFront = (l) => ({
    waves:    `<path d="M30 40c0-18 10-26 20-26s22 6 22 26c-6-8-14-13-24-12-8 1-13 6-18 12z" fill="${l.hair}"/><path d="M50 14c-8 6-11 14-12 22" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>`,
    bob:      `<path d="M29 44c-2-20 8-31 21-31s23 10 21 31c-4-6-8-8-12-8H40c-5 0-8 3-11 8z" fill="${l.hair}"/><path d="M33 36h34" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>`,
    curls:    `<g fill="${l.hair}"><circle cx="38" cy="22" r="11"/><circle cx="50" cy="18" r="12"/><circle cx="62" cy="22" r="11"/><circle cx="31" cy="31" r="9"/><circle cx="69" cy="31" r="9"/></g>`,
    straight: `<path d="M30 44c-1-20 8-30 20-30s21 10 20 30c-6-10-12-14-20-14-4 4-12 8-20 14z" fill="${l.hair}"/>`,
    pony:     `<path d="M31 40c0-17 9-25 19-25 11 0 19 8 19 25-8-10-26-14-38 0z" fill="${l.hair}"/><circle cx="67" cy="27" r="3" fill="${l.c1}"/>`,
    bun:      `<path d="M31 40c0-16 9-23 19-23s19 7 19 23c-7-9-15-12-19-12s-12 3-19 12z" fill="${l.hair}"/>`,
    braids:   `<path d="M30 42c0-18 9-27 20-27s20 9 20 27c-6-9-13-13-20-13s-14 4-20 13z" fill="${l.hair}"/>`,
    pixie:    `<path d="M30 42c-2-20 8-29 21-29 12 0 21 9 19 23-6-8-18-12-27-6-5 3-9 7-13 12z" fill="${l.hair}"/><path d="M30 42c-1 6 0 11 2 14" stroke="${l.hair}" stroke-width="3" fill="none"/>`,
  }[l.style]);

  const outfit = (l) => {
    const body = (fill) => `<path d="M8 110c2-18 12-28 26-31l9-3h14l9 3c14 3 24 13 26 31z" fill="${fill}"/>`;
    switch (l.outfit) {
      case 'gown':    return `<path d="M8 110c2-18 12-28 26-31l8-2c3 4 13 6 16 0l8 2c14 3 24 13 26 31z" fill="${l.skin}"/>
        <path d="M14 110c2-12 8-20 18-24 6 6 30 6 36 0 10 4 16 12 18 24z" fill="${l.c1}"/><path d="M34 86l-3-10M66 86l3-10" stroke="${l.c2}" stroke-width="2"/><path d="M38 90c8 3 16 3 24 0" stroke="${l.c2}" stroke-width="1.5" fill="none" opacity=".6"/>`;
      case 'blazer':  return body(l.c1) + `<path d="M43 76l7 22 7-22z" fill="${l.skin}"/><path d="M43 76l-7 34h8l6-12zM57 76l7 34h-8l-6-12z" fill="${l.c2}"/><circle cx="50" cy="104" r="1.6" fill="#D4AF37"/>`;
      case 'sequin':  return `<path d="M8 110c2-18 12-28 26-31l9-3c2 3 12 3 14 0l9 3c14 3 24 13 26 31z" fill="${l.skin}"/><path d="M16 110c2-12 8-20 17-23l17 8 17-8c9 3 15 11 17 23z" fill="${l.c1}"/>
        <g fill="${l.c2}" opacity=".7">${[[24,98],[32,93],[40,100],[50,97],[60,100],[68,93],[76,98],[30,106],[46,106],[54,106],[70,106],[38,94],[62,94]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g><g fill="#fff" opacity=".8"><circle cx="34" cy="99" r=".9"/><circle cx="58" cy="103" r=".9"/><circle cx="72" cy="101" r=".9"/></g>`;
      case 'satin':   return body(l.c1) + `<path d="M40 77c4 8 16 8 20 0" fill="${l.skin}"/><path d="M22 92c10 6 22 8 28 8s18-2 28-8" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none"/>`;
      case 'leather': return body(l.c1) + `<path d="M42 76l8 10 8-10" fill="#E9E3D8"/><path d="M42 76l-10 34M58 76l10 34" stroke="${l.c2}" stroke-width="5"/><path d="M50 86v24" stroke="#9A9AA6" stroke-width="1.5" stroke-dasharray="2 1.5"/>`;
      case 'dealer':  return body(l.c1) + `<path d="M30 82l14 28H14c2-14 8-23 16-28zM70 82L56 110h30c-2-14-8-23-16-28z" fill="${l.c2}"/><path d="M44 79l6 3 6-3-2 5 2 5-6-3-6 3 2-5z" fill="#B3122E"/><circle cx="50" cy="96" r="1.3" fill="#B08D3A"/><circle cx="50" cy="104" r="1.3" fill="#B08D3A"/>`;
      case 'jacket':  return body(l.c1) + `<path d="M41 77c3 6 15 6 18 0v33H41z" fill="#141418"/><path d="M41 77l-6 33M59 77l6 33" stroke="${l.c2}" stroke-width="3"/>`;
      default:        return body(l.c1);
    }
  };

  const earrings = (l) => ({
    hoop: `<g fill="none" stroke="#E8C15A" stroke-width="1.6"><circle cx="31.5" cy="55" r="3.4"/><circle cx="68.5" cy="55" r="3.4"/></g>`,
    stud: `<g fill="#F4F4F8"><circle cx="31.8" cy="51.5" r="1.4"/><circle cx="68.2" cy="51.5" r="1.4"/></g>`,
    drop: `<g fill="#E8C15A"><path d="M31.5 51v4"/><circle cx="31.5" cy="56.5" r="2"/><circle cx="68.5" cy="56.5" r="2"/></g><path d="M31.5 51v4M68.5 51v4" stroke="#E8C15A" stroke-width="1"/>`,
  }[l.ear]);

  let uid = 0;
  const necklace = (l) => (['gown', 'sequin', 'satin'].includes(l.outfit) ? `<path d="M40 74c4 6 16 6 20 0" fill="none" stroke="#E8C15A" stroke-width=".9"/><path d="M50 80l-2.2 3 2.2 3.4 2.2-3.4z" fill="#F4F4F8" stroke="#E8C15A" stroke-width=".5"/>` : '');
  function avatarSVG(id) {
    const l = LOOKS[((+id % LOOKS.length) + LOOKS.length) % LOOKS.length];
    const u = 'a' + (++uid);
    // light from the upper left: skin, hair and lips get a soft gradient; the outfit gets a sheen
    const defs = `<defs>
      <radialGradient id="${u}s" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
      <linearGradient id="${u}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
      <linearGradient id="${u}o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".35" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
      <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l.lips}"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
      <clipPath id="${u}c"><path d="M8 110c2-18 12-28 26-31l9-3h14l9 3c14 3 24 13 26 31z"/></clipPath></defs>`;
    return `<svg class="av-svg" viewBox="0 0 100 110" aria-hidden="true" focusable="false">${defs}
      ${hairBack(l)}<g style="mix-blend-mode:normal">${hairBack(l).replace(/fill="[^"]*"/g, `fill="url(#${u}h)"`)}</g>
      ${outfit(l)}<rect x="0" y="70" width="100" height="40" fill="url(#${u}o)" clip-path="url(#${u}c)"/>${necklace(l)}
      <path d="M43 62h14v16c-4 3-10 3-14 0z" fill="${l.shade}"/>
      <ellipse class="av-ear" cx="31.5" cy="47" rx="3" ry="5" fill="${l.shade}"/><ellipse cx="68.5" cy="47" rx="3" ry="5" fill="${l.shade}"/>
      <path d="M32 40c0-15 8-23 18-23s18 8 18 23c0 13-6 26-18 26S32 53 32 40z" fill="${l.skin}"/>
      <path d="M32 40c0-15 8-23 18-23s18 8 18 23c0 13-6 26-18 26S32 53 32 40z" fill="url(#${u}s)"/>
      <path d="M36 52c3 9 8 14 14 14s11-5 14-14c-3 6-8 10-14 10s-11-4-14-10z" fill="${l.shade}" opacity=".35"/>
      ${earrings(l)}
      <g class="av-open">
        <ellipse cx="41.5" cy="42.6" rx="5.4" ry="2.8" fill="${l.c1}" opacity=".28"/><ellipse cx="58.5" cy="42.6" rx="5.4" ry="2.8" fill="${l.c1}" opacity=".28"/>
        <path d="M37 39c3-2 6-2 9 0M54 39c3-2 6-2 9 0" stroke="${l.hair}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M37.5 44.5c2-2.5 6-2.5 8 0-2 2-6 2-8 0z" fill="#fff"/><path d="M54.5 44.5c2-2.5 6-2.5 8 0-2 2-6 2-8 0z" fill="#fff"/>
        <circle cx="41.5" cy="44.4" r="1.9" fill="${l.eyes}"/><circle cx="58.5" cy="44.4" r="1.9" fill="${l.eyes}"/>
        <circle cx="42.1" cy="43.8" r=".55" fill="#fff"/><circle cx="59.1" cy="43.8" r=".55" fill="#fff"/>
        <path d="M37 44.6c2-3 6-3.4 8.6-.6l1.4-1M63 44.6c-2-3-6-3.4-8.6-.6l-1.4-1" stroke="#111" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M37.2 43.6l-1.6-1.2M38.6 42.4l-1-1.6M61.4 42.4l1-1.6M62.8 43.6l1.6-1.2" stroke="#111" stroke-width=".8" stroke-linecap="round"/>
        <path d="M44.6 58c3.2 1.8 7.6 1.8 10.8 0-1.6 3.2-9.2 3.2-10.8 0z" fill="url(#${u}l)"/><path d="M44.6 58c2.2-1.2 3.8-1.6 5.4-.7 1.6-.9 3.2-.5 5.4.7-3.2.7-7.6.7-10.8 0z" fill="${l.lips}"/>
        <ellipse cx="51.4" cy="59.6" rx="1.6" ry=".6" fill="#fff" opacity=".45"/>
      </g>
      <g class="av-shut">
        <path d="M36 38c3 1 6 2 9 4M64 38c-3 1-6 2-9 4" stroke="${l.hair}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M37.5 45c2.5 1.5 5.5 1.5 8 0M54.5 45c2.5 1.5 5.5 1.5 8 0" stroke="#111" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="59" rx="3.2" ry="2.4" fill="${l.lips}"/>
      </g>
      <path d="M49 47c-.6 3-1.4 5-2 6.5 1.5.8 3 .8 4.5 0" stroke="${l.shade}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="38.5" cy="52" rx="3.4" ry="2" fill="#FF6F7D" opacity=".22"/><ellipse cx="61.5" cy="52" rx="3.4" ry="2" fill="#FF6F7D" opacity=".22"/>
      ${hairFront(l)}<g>${hairFront(l).replace(/fill="(?!none)[^"]*"/g, `fill="url(#${u}h)"`)}</g>
    </svg>`;
  }

  /* the wicker basket: up to seven tomatoes show, past that it stays full */
  function basketSVG(n) {
    const k = Math.max(0, Math.min(7, n | 0));
    const spots = [[15, 16], [27, 17], [39, 17], [51, 16], [21, 9], [33, 8], [45, 9]];
    const toms = spots.slice(0, k).map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle r="6.2" fill="url(#tg)"/><path d="M-2.6-5.4l2.6 1.6 2.6-1.6-1.2 2.4 2 .6-3.4.4-1.6 1.4-1.4-1.4-3-.6 1.8-.8z" fill="#3E8E2F"/><ellipse cx="-2" cy="-1.6" rx="1.6" ry="1" fill="#fff" opacity=".35"/></g>`).join('');
    return `<svg class="bk-svg" viewBox="0 0 68 44" aria-hidden="true" focusable="false">
      <defs><radialGradient id="tg" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#FF6A4D"/><stop offset=".6" stop-color="#E0342B"/><stop offset="1" stop-color="#A4161A"/></radialGradient>
      <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98B4B"/><stop offset="1" stop-color="#8A5527"/></linearGradient></defs>
      <path d="M10 18c2-12 46-12 48 0" fill="none" stroke="#8A5527" stroke-width="2.6"/>
      ${toms}
      <path d="M4 20h60l-6 20c-1 2-3 3-5 3H15c-2 0-4-1-5-3z" fill="url(#wk)"/>
      <g stroke="#6E401B" stroke-width="1" opacity=".75" fill="none"><path d="M6 26h56M8 32h52M10 38h48"/><path d="M14 20l3 22M24 20l1.5 22M34 20v22M44 20l-1.5 22M54 20l-3 22"/></g>
      <path d="M3 18.5h62v3.4H3z" fill="#A86B34"/>
    </svg>`;
  }

  /* one tomato for flying, and the mess it leaves */
  const tomatoSVG = () => `<svg viewBox="-10 -10 20 20" class="tm-svg" aria-hidden="true"><defs><radialGradient id="tf" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#FF6A4D"/><stop offset=".6" stop-color="#E0342B"/><stop offset="1" stop-color="#A4161A"/></radialGradient></defs><circle r="8" fill="url(#tf)"/><path d="M-3.4-7l3.4 2 3.4-2-1.6 3.2 2.6.8-4.4.5-2 1.8-1.8-1.8-4-.8 2.4-1z" fill="#3E8E2F"/><ellipse cx="-2.6" cy="-2" rx="2" ry="1.2" fill="#fff" opacity=".35"/></svg>`;
  const splatSVG = () => `<svg viewBox="0 0 100 100" class="sp-svg" aria-hidden="true">
    <g fill="#D7281F"><path d="M50 22c8 0 9 9 16 8s14 6 10 13 4 12-3 17-3 14-12 13-10 8-17 3-14 2-14-7-11-8-6-14-4-12 4-17 8-3 9-14 21-16z"/>
    <circle cx="20" cy="30" r="5"/><circle cx="82" cy="28" r="4"/><circle cx="86" cy="62" r="5"/><circle cx="14" cy="64" r="4"/><circle cx="30" cy="88" r="3"/><circle cx="74" cy="86" r="3.4"/></g>
    <g fill="#F2E3B3" opacity=".9"><ellipse cx="44" cy="44" rx="2" ry="3.2" transform="rotate(30 44 44)"/><ellipse cx="58" cy="52" rx="2" ry="3.2" transform="rotate(-20 58 52)"/><ellipse cx="50" cy="60" rx="2" ry="3.2" transform="rotate(70 50 60)"/><ellipse cx="38" cy="58" rx="1.8" ry="2.8"/></g>
    <g fill="#B71C1C" class="sp-drip"><path d="M36 70c2 0 3 2 3 6v10c0 3-4 3-4 0V76c0-4-1-6 1-6z"/><path d="M60 72c2 0 2.6 2 2.6 5v14c0 3-4 3-4 0V77c0-3-.6-5 1.4-5z"/><path d="M48 74c1.6 0 2 1.6 2 4v6c0 2.6-3.4 2.6-3.4 0v-6c0-2.4 0-4 1.4-4z"/></g>
    <path d="M40 34c6-4 14-2 18 2" stroke="#FF8A70" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M44 16l2 2M48 15h0M62 18l-2 2" stroke="#3E8E2F" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;

  root.PokerArt = { LOOKS, avatarSVG, basketSVG, tomatoSVG, splatSVG, count: LOOKS.length };
})(window);
