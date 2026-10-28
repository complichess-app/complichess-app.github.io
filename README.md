# Barusik Platforms — barusik.com

Six platforms under one account, in six languages (he, en, ar, ru, es, fr):
Bar Lvovski Travel, Platformika, Complichess, Barusik Crypto, LearnLume and What Penina thinks.

- Site source: `_src/` (Next.js static export + TypeScript + Tailwind, React Three Fiber, GSAP, Lenis, Motion)
- Web apps: `/platformika/`, `/travel/`, `/crypto/`, `/penina/`, `/admin/` (in `_src/public/`)
- Complichess is served from the `complichess` repo at `/complichess/`
- Database and server functions: `_src/supabase/` (run the `.sql` files in the Supabase SQL editor; deploy `functions/penina`)
- Rebuild: `sh _src/deploy.sh`, then commit and push.

© Bar Lvovski — all rights reserved. See LICENSE.
