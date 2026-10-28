-- Barusik Crypto: a full exchange — coins, order book, price-time matching, balances, fees, user-created coins.
-- Runs on the same Supabase project as the rest of barusik.com (same accounts, same is_admin()).
-- Safe to run more than once.
--
-- MONEY MODE
--   'demo' (default): balances are play money (USDB). Every new account can claim a starting balance once.
--   'live': real money. Locked by design: cx_set_mode('live') refuses unless a license number from the
--           Israel Capital Market Authority (financial-asset service provider) is recorded first, and there are
--           no deposit/withdraw functions here at all. Real custody needs its own audited service.
--
-- All money moves happen inside the security-definer functions below; the app cannot write to any table directly.


-- ============ settings ============
create table if not exists public.cx_settings (key text primary key, value text not null);
alter table public.cx_settings enable row level security;
insert into public.cx_settings values
  ('mode', 'demo'), ('license', ''), ('fee_maker', '0.001'), ('fee_taker', '0.002'),
  ('house', '00000000-0000-0000-0000-00000000b0b0'), ('faucet', '10000'), ('create_fee', '100')
on conflict (key) do nothing;
drop policy if exists "cx_settings read" on public.cx_settings;
create policy "cx_settings read" on public.cx_settings for select using (key in ('mode', 'fee_maker', 'fee_taker', 'faucet', 'create_fee'));

create or replace function public.cx_cfg(k text) returns text language sql stable security definer set search_path = public as
$$ select value from public.cx_settings where key = k $$;
create or replace function public.cx_house() returns uuid language sql stable security definer set search_path = public as
$$ select value::uuid from public.cx_settings where key = 'house' $$;

-- ============ assets ============
-- USDB is the quote currency of every market (demo dollar in demo mode).
create table if not exists public.cx_assets (
  symbol text primary key check (symbol ~ '^[A-Z][A-Z0-9]{1,9}$'),
  name text not null check (char_length(name) between 2 and 32),
  kind text not null default 'listed' check (kind in ('quote', 'listed', 'user')),
  creator uuid references auth.users on delete set null,
  supply numeric(38, 8),
  hue int not null default 170 check (hue between 0 and 359),
  about text not null default '' check (char_length(about) <= 280),
  tick numeric(38, 8) not null default 0.00000001 check (tick > 0),
  ref_price numeric(38, 8),
  halted boolean not null default false,
  created_at timestamptz not null default now()
);
insert into public.cx_assets (symbol, name, kind, hue, tick, ref_price) values
  ('USDB', 'Barusik Dollar', 'quote', 150, 0.01, 1),
  ('BTC', 'Bitcoin', 'listed', 33, 0.01, null),
  ('ETH', 'Ethereum', 'listed', 230, 0.01, null),
  ('SOL', 'Solana', 'listed', 280, 0.001, null),
  ('XRP', 'XRP', 'listed', 210, 0.0001, null),
  ('DOGE', 'Dogecoin', 'listed', 45, 0.00001, null)
on conflict (symbol) do nothing;

-- ============ balances ============
create table if not exists public.cx_balances (
  uid uuid not null,
  asset text not null references public.cx_assets on delete cascade,
  available numeric(38, 8) not null default 0 check (available >= 0),
  locked numeric(38, 8) not null default 0 check (locked >= 0),
  primary key (uid, asset)
);

-- ============ orders & trades ============
create table if not exists public.cx_orders (
  id bigint generated always as identity primary key,
  uid uuid not null,
  market text not null references public.cx_assets on delete cascade,
  side text not null check (side in ('buy', 'sell')),
  price numeric(38, 8) not null check (price > 0),
  qty numeric(38, 8) not null check (qty > 0),
  filled numeric(38, 8) not null default 0,
  reserve numeric(38, 8) not null default 0,         -- what is still locked for this order (USDB for buys, coins for sells)
  status text not null default 'open' check (status in ('open', 'filled', 'cancelled')),
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists cx_orders_book on public.cx_orders (market, side, price, id) where status = 'open';
create index if not exists cx_orders_user on public.cx_orders (uid, created_at desc);

create table if not exists public.cx_trades (
  id bigint generated always as identity primary key,
  market text not null references public.cx_assets on delete cascade,
  price numeric(38, 8) not null,
  qty numeric(38, 8) not null,
  taker_side text not null check (taker_side in ('buy', 'sell')),
  buy_order bigint, sell_order bigint,
  buyer uuid, seller uuid,
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists cx_trades_market on public.cx_trades (market, created_at desc);

-- every balance change, for audits and the admin page
create table if not exists public.cx_ledger (
  id bigint generated always as identity primary key,
  uid uuid not null, asset text not null, delta numeric(38, 8) not null,
  reason text not null, ref bigint,
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists cx_ledger_user on public.cx_ledger (uid, created_at desc);

alter table public.cx_assets enable row level security;
alter table public.cx_balances enable row level security;
alter table public.cx_orders enable row level security;
alter table public.cx_trades enable row level security;
alter table public.cx_ledger enable row level security;

drop policy if exists "cx_assets read" on public.cx_assets;
create policy "cx_assets read" on public.cx_assets for select using (true);
-- cx_trades has no read policy: it holds user ids. The public tape comes from cx_tape() below.
drop policy if exists "cx_balances own" on public.cx_balances;
create policy "cx_balances own" on public.cx_balances for select to authenticated using (uid = auth.uid());
drop policy if exists "cx_orders own" on public.cx_orders;
create policy "cx_orders own" on public.cx_orders for select to authenticated using (uid = auth.uid());
drop policy if exists "cx_ledger own" on public.cx_ledger;
create policy "cx_ledger own" on public.cx_ledger for select to authenticated using (uid = auth.uid());

do $$ begin
  begin alter publication supabase_realtime add table public.cx_balances; exception when others then null; end;
  begin alter publication supabase_realtime add table public.cx_orders; exception when others then null; end;
end $$;

-- ============ internal helpers ============
create or replace function public.cx_move(p_uid uuid, p_asset text, p_avail numeric, p_lock numeric, p_reason text, p_ref bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_avail = 0 and p_lock = 0 then return; end if;
  insert into public.cx_balances (uid, asset, available, locked) values (p_uid, p_asset, 0, 0) on conflict do nothing;
  update public.cx_balances set available = available + p_avail, locked = locked + p_lock
   where uid = p_uid and asset = p_asset;
  if p_avail + p_lock <> 0 then
    insert into public.cx_ledger (uid, asset, delta, reason, ref) values (p_uid, p_asset, p_avail + p_lock, p_reason, p_ref);
  end if;
exception when check_violation then
  raise exception 'insufficient %', p_asset using errcode = 'P0001';
end $$;
revoke all on function public.cx_move(uuid, text, numeric, numeric, text, bigint) from public, anon, authenticated;

create or replace function public.cx_round_down(v numeric, step numeric) returns numeric language sql immutable as
$$ select floor(v / step) * step $$;

-- ============ matching engine ============
-- Price-time priority. The maker's price is the trade price. Fees: maker fee on the maker, taker fee on the taker,
-- both in USDB, paid to the house account. A user never trades with themself (their own resting orders are skipped).
-- p_tif: 'GTC' rests what is left; 'IOC' cancels what is left.
create or replace function public.cx_engine(p_uid uuid, p_market text, p_side text, p_price numeric, p_qty numeric, p_tif text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  a public.cx_assets; o public.cx_orders; m public.cx_orders;
  fm numeric := public.cx_cfg('fee_maker')::numeric; ft numeric := public.cx_cfg('fee_taker')::numeric;
  house uuid := public.cx_house(); left_qty numeric; q numeric; cost numeric; fee_t numeric; fee_m numeric;
  trades int := 0; tid bigint;
begin
  select * into a from public.cx_assets where symbol = p_market;
  if not found or a.kind = 'quote' then raise exception 'unknown market' using errcode = 'P0001'; end if;
  if a.halted then raise exception 'market halted' using errcode = 'P0001'; end if;
  if p_side not in ('buy', 'sell') or p_tif not in ('GTC', 'IOC') then raise exception 'bad order' using errcode = 'P0001'; end if;
  p_price := public.cx_round_down(p_price, a.tick);
  p_qty := round(p_qty, 8);
  if p_price <= 0 or p_qty <= 0 then raise exception 'bad order' using errcode = 'P0001'; end if;
  if p_price * p_qty < 0.01 then raise exception 'order too small' using errcode = 'P0001'; end if;

  insert into public.cx_orders (uid, market, side, price, qty, reserve)
  values (p_uid, p_market, p_side, p_price, p_qty,
          case when p_side = 'buy' then round(p_price * p_qty * (1 + ft), 8) else p_qty end)
  returning * into o;
  if p_side = 'buy' then perform public.cx_move(p_uid, 'USDB', -o.reserve, o.reserve, 'lock', o.id);
  else perform public.cx_move(p_uid, p_market, -o.reserve, o.reserve, 'lock', o.id); end if;

  left_qty := p_qty;
  loop
    exit when left_qty <= 0;
    if p_side = 'buy' then
      select * into m from public.cx_orders
       where market = p_market and side = 'sell' and status = 'open' and price <= p_price and uid <> p_uid
       order by price asc, id asc limit 1 for update;
    else
      select * into m from public.cx_orders
       where market = p_market and side = 'buy' and status = 'open' and price >= p_price and uid <> p_uid
       order by price desc, id asc limit 1 for update;
    end if;
    exit when not found;

    q := least(left_qty, m.qty - m.filled);
    cost := round(m.price * q, 8);
    fee_t := round(cost * ft, 8);
    fee_m := round(cost * fm, 8);

    insert into public.cx_trades (market, price, qty, taker_side, buy_order, sell_order, buyer, seller)
    values (p_market, m.price, q, p_side,
            case when p_side = 'buy' then o.id else m.id end, case when p_side = 'buy' then m.id else o.id end,
            case when p_side = 'buy' then p_uid else m.uid end, case when p_side = 'buy' then m.uid else p_uid end)
    returning id into tid;

    if p_side = 'buy' then
      -- taker pays cost + fee out of its lock, gets coins; maker (seller) gives coins, gets cost - fee
      perform public.cx_move(p_uid, 'USDB', 0, -(cost + fee_t), 'trade', tid);
      perform public.cx_move(p_uid, p_market, q, 0, 'trade', tid);
      perform public.cx_move(m.uid, p_market, 0, -q, 'trade', tid);
      perform public.cx_move(m.uid, 'USDB', cost - fee_m, 0, 'trade', tid);
      update public.cx_orders set reserve = reserve - (cost + fee_t) where id = o.id;
      update public.cx_orders set filled = filled + q, reserve = reserve - q,
             status = case when filled + q >= qty then 'filled' else 'open' end where id = m.id;
    else
      -- taker gives coins, gets cost - fee; maker (buyer) pays cost + fee out of its lock, gets coins
      perform public.cx_move(p_uid, p_market, 0, -q, 'trade', tid);
      perform public.cx_move(p_uid, 'USDB', cost - fee_t, 0, 'trade', tid);
      perform public.cx_move(m.uid, 'USDB', 0, -(cost + fee_m), 'trade', tid);
      perform public.cx_move(m.uid, p_market, q, 0, 'trade', tid);
      update public.cx_orders set reserve = reserve - q where id = o.id;
      update public.cx_orders set filled = filled + q, reserve = reserve - (cost + fee_m),
             status = case when filled + q >= qty then 'filled' else 'open' end where id = m.id;
    end if;
    perform public.cx_move(house, 'USDB', fee_t + fee_m, 0, 'fee', tid);

    -- a filled maker buy may have locked more than it spent (it locked at its own price with the taker fee rate)
    select * into m from public.cx_orders where id = m.id;
    if m.status = 'filled' and m.reserve > 0 then
      perform public.cx_move(m.uid, case when m.side = 'buy' then 'USDB' else p_market end, m.reserve, -m.reserve, 'unlock', m.id);
      update public.cx_orders set reserve = 0 where id = m.id;
    end if;

    update public.cx_orders set filled = filled + q where id = o.id;
    left_qty := left_qty - q; trades := trades + 1;
  end loop;

  select * into o from public.cx_orders where id = o.id;
  if o.filled >= o.qty or p_tif = 'IOC' then
    if o.reserve > 0 then
      perform public.cx_move(p_uid, case when p_side = 'buy' then 'USDB' else p_market end, o.reserve, -o.reserve, 'unlock', o.id);
    end if;
    update public.cx_orders set reserve = 0, status = case when filled >= qty then 'filled' else 'cancelled' end where id = o.id;
  end if;
  if trades > 0 then update public.cx_assets set ref_price = (select price from public.cx_trades where market = p_market order by id desc limit 1) where symbol = p_market; end if;

  select * into o from public.cx_orders where id = o.id;
  return jsonb_build_object('id', o.id, 'status', o.status, 'filled', o.filled, 'qty', o.qty, 'trades', trades);
end $$;
revoke all on function public.cx_engine(uuid, text, text, numeric, numeric, text) from public, anon, authenticated;

-- ============ what the app calls ============
create or replace function public.cx_require_user() returns uuid language plpgsql stable as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'sign in first' using errcode = '42501'; end if;
  return u;
end $$;

create or replace function public.cx_rate_limit(p_uid uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.cx_orders where uid = p_uid and created_at > clock_timestamp() - interval '10 seconds') >= 20 then
    raise exception 'slow down' using errcode = 'P0001';
  end if;
end $$;

-- limit order (GTC). Market order = cx_market.
create or replace function public.cx_order(p_market text, p_side text, p_price numeric, p_qty numeric)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user();
begin
  perform public.cx_rate_limit(u);
  return public.cx_engine(u, upper(p_market), p_side, p_price, p_qty, 'GTC');
end $$;

-- market order: fills against the book now, up to 5% away from the best price, the rest is cancelled
create or replace function public.cx_market(p_market text, p_side text, p_qty numeric)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user(); best numeric;
begin
  perform public.cx_rate_limit(u);
  p_market := upper(p_market);
  if p_side = 'buy' then
    select min(price) into best from public.cx_orders where market = p_market and side = 'sell' and status = 'open' and uid <> u;
    if best is null then raise exception 'no sellers' using errcode = 'P0001'; end if;
    return public.cx_engine(u, p_market, 'buy', best * 1.05, p_qty, 'IOC');
  else
    select max(price) into best from public.cx_orders where market = p_market and side = 'buy' and status = 'open' and uid <> u;
    if best is null then raise exception 'no buyers' using errcode = 'P0001'; end if;
    return public.cx_engine(u, p_market, 'sell', best * 0.95, p_qty, 'IOC');
  end if;
end $$;

create or replace function public.cx_cancel(p_id bigint) returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user(); o public.cx_orders;
begin
  select * into o from public.cx_orders where id = p_id and uid = u and status = 'open' for update;
  if not found then raise exception 'no such order' using errcode = 'P0001'; end if;
  if o.reserve > 0 then
    perform public.cx_move(u, case when o.side = 'buy' then 'USDB' else o.market end, o.reserve, -o.reserve, 'unlock', o.id);
  end if;
  update public.cx_orders set status = 'cancelled', reserve = 0 where id = o.id;
  return jsonb_build_object('id', o.id, 'status', 'cancelled');
end $$;

create or replace function public.cx_cancel_all(p_market text default null) returns int language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user(); r record; n int := 0;
begin
  for r in select id from public.cx_orders where uid = u and status = 'open' and (p_market is null or market = upper(p_market)) loop
    perform public.cx_cancel(r.id); n := n + 1;
  end loop;
  return n;
end $$;

-- starting balance, once per account, demo mode only
create or replace function public.cx_claim() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user(); amt numeric := public.cx_cfg('faucet')::numeric;
begin
  if public.cx_cfg('mode') <> 'demo' then raise exception 'demo only' using errcode = 'P0001'; end if;
  if exists (select 1 from public.cx_ledger where uid = u and reason = 'claim') then raise exception 'already claimed' using errcode = 'P0001'; end if;
  perform public.cx_move(u, 'USDB', amt, 0, 'claim', null);
  return jsonb_build_object('usdb', amt);
end $$;

-- create a coin: the creator pays the listing fee and receives the whole supply
create or replace function public.cx_create_coin(p_symbol text, p_name text, p_supply numeric, p_hue int, p_about text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := public.cx_require_user(); fee numeric := public.cx_cfg('create_fee')::numeric; s text := upper(trim(p_symbol));
begin
  if s !~ '^[A-Z][A-Z0-9]{1,9}$' then raise exception 'symbol: 2-10 letters/digits' using errcode = 'P0001'; end if;
  if char_length(trim(p_name)) not between 2 and 32 then raise exception 'name: 2-32 characters' using errcode = 'P0001'; end if;
  if p_supply is null or p_supply < 1000 or p_supply > 1e15 then raise exception 'supply: 1,000 to 1,000,000,000,000,000' using errcode = 'P0001'; end if;
  if exists (select 1 from public.cx_assets where symbol = s) then raise exception 'symbol taken' using errcode = 'P0001'; end if;
  if (select count(*) from public.cx_assets where creator = u and created_at > now() - interval '1 day') >= 3 then
    raise exception 'three coins a day' using errcode = 'P0001';
  end if;
  perform public.cx_move(u, 'USDB', -fee, 0, 'create', null);
  perform public.cx_move(public.cx_house(), 'USDB', fee, 0, 'create', null);
  insert into public.cx_assets (symbol, name, kind, creator, supply, hue, about, tick)
  values (s, trim(p_name), 'user', u, round(p_supply, 8), coalesce(p_hue, 170) % 360, left(coalesce(p_about, ''), 280), 0.00000001);
  perform public.cx_move(u, s, round(p_supply, 8), 0, 'mint', null);
  return jsonb_build_object('symbol', s);
end $$;

-- ============ market data (public) ============
create or replace function public.cx_book(p_market text, p_depth int default 14) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'bids', coalesce((select jsonb_agg(jsonb_build_array(price, q) order by price desc) from (
        select price, sum(qty - filled) q from public.cx_orders where market = upper(p_market) and side = 'buy' and status = 'open'
        group by price order by price desc limit least(p_depth, 50)) b), '[]'),
    'asks', coalesce((select jsonb_agg(jsonb_build_array(price, q) order by price asc) from (
        select price, sum(qty - filled) q from public.cx_orders where market = upper(p_market) and side = 'sell' and status = 'open'
        group by price order by price asc limit least(p_depth, 50)) s), '[]'));
$$;

create or replace function public.cx_tape(p_market text, p_limit int default 40) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_array(id, price, qty, taker_side, extract(epoch from created_at)) order by id desc), '[]') from (
    select id, price, qty, taker_side, created_at from public.cx_trades where market = upper(p_market) order by id desc limit least(p_limit, 200)) t;
$$;

create or replace function public.cx_candles(p_market text, p_minutes int default 15, p_limit int default 120) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_array(extract(epoch from b)::bigint, o, h, l, c, v) order by b), '[]') from (
    select date_bin(make_interval(mins => greatest(1, least(p_minutes, 1440))), created_at, timestamptz '2020-01-01') b,
           (array_agg(price order by id))[1] o, max(price) h, min(price) l, (array_agg(price order by id desc))[1] c, sum(qty) v
      from public.cx_trades where market = upper(p_market)
       and created_at > now() - make_interval(mins => greatest(1, least(p_minutes, 1440)) * least(p_limit, 500))
     group by 1) t;
$$;

create or replace function public.cx_markets() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by (x->>'vol')::numeric desc nulls last, x->>'symbol'), '[]') from (
    select jsonb_build_object(
      'symbol', a.symbol, 'name', a.name, 'kind', a.kind, 'hue', a.hue, 'about', a.about, 'tick', a.tick, 'supply', a.supply,
      'halted', a.halted,
      'last', coalesce((select price from public.cx_trades t where t.market = a.symbol order by id desc limit 1), a.ref_price),
      'open24', (select price from public.cx_trades t where t.market = a.symbol and created_at <= now() - interval '24 hours' order by id desc limit 1),
      'first24', (select price from public.cx_trades t where t.market = a.symbol and created_at > now() - interval '24 hours' order by id asc limit 1),
      'vol', (select sum(price * qty) from public.cx_trades t where t.market = a.symbol and created_at > now() - interval '24 hours'),
      'bid', (select max(price) from public.cx_orders o where o.market = a.symbol and side = 'buy' and status = 'open'),
      'ask', (select min(price) from public.cx_orders o where o.market = a.symbol and side = 'sell' and status = 'open')
    ) x from public.cx_assets a where a.kind <> 'quote') m;
$$;

grant execute on function public.cx_tape(text, int), public.cx_book(text, int), public.cx_candles(text, int, int), public.cx_markets() to anon, authenticated;
grant execute on function public.cx_order(text, text, numeric, numeric), public.cx_market(text, text, numeric),
  public.cx_cancel(bigint), public.cx_cancel_all(text), public.cx_claim(),
  public.cx_create_coin(text, text, numeric, int, text) to authenticated;
revoke execute on function public.cx_rate_limit(uuid), public.cx_cfg(text), public.cx_house() from public, anon, authenticated;

-- ============ admin ============
-- house liquidity for listed coins around a reference price (demo mode only): a ladder of bids and asks
create or replace function public.cx_admin_liquidity(p_market text, p_ref numeric, p_levels int default 12, p_spread numeric default 0.002, p_notional numeric default 2000)
returns int language plpgsql security definer set search_path = public as $$
declare h uuid := public.cx_house(); i int; px numeric; q numeric; n int := 0; r record; s text := upper(p_market);
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if public.cx_cfg('mode') <> 'demo' then raise exception 'demo only' using errcode = 'P0001'; end if;
  if p_ref is null or p_ref <= 0 then raise exception 'bad price' using errcode = 'P0001'; end if;
  for r in select id, side, market, reserve from public.cx_orders where uid = h and market = s and status = 'open' loop
    perform public.cx_move(h, case when r.side = 'buy' then 'USDB' else r.market end, r.reserve, -r.reserve, 'unlock', r.id);
    update public.cx_orders set status = 'cancelled', reserve = 0 where id = r.id;
  end loop;
  update public.cx_assets set ref_price = p_ref where symbol = s;
  for i in 1..least(greatest(p_levels, 1), 40) loop
    px := p_ref * (1 - p_spread * i); q := round(p_notional / px, 8);
    perform public.cx_move(h, 'USDB', px * q * 1.01, 0, 'house', null);
    perform public.cx_engine(h, s, 'buy', px, q, 'GTC'); n := n + 1;
    px := p_ref * (1 + p_spread * i); q := round(p_notional / px, 8);
    perform public.cx_move(h, s, q, 0, 'house', null);
    perform public.cx_engine(h, s, 'sell', px, q, 'GTC'); n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.cx_admin_halt(p_market text, p_halted boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  update public.cx_assets set halted = p_halted where symbol = upper(p_market);
end $$;

-- switching to real money needs a recorded license first, and is refused anyway while no custody service exists
create or replace function public.cx_set_mode(p_mode text, p_license text default null) returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_mode = 'demo' then update public.cx_settings set value = 'demo' where key = 'mode'; return 'demo'; end if;
  if p_mode <> 'live' then raise exception 'bad mode' using errcode = 'P0001'; end if;
  if coalesce(nullif(trim(p_license), ''), public.cx_cfg('license')) = '' then
    raise exception 'live mode needs an Israel Capital Market Authority license number' using errcode = 'P0001';
  end if;
  raise exception 'live mode needs a custody service (deposits, withdrawals, cold storage) — not installed' using errcode = 'P0001';
end $$;

create or replace function public.cx_admin_overview() returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return jsonb_build_object(
    'mode', public.cx_cfg('mode'),
    'fees_usdb', (select coalesce(sum(delta), 0) from public.cx_ledger where reason in ('fee', 'create') and uid = public.cx_house()),
    'house_usdb', (select available + locked from public.cx_balances where uid = public.cx_house() and asset = 'USDB'),
    'traders', (select count(distinct uid) from public.cx_balances where uid <> public.cx_house()),
    'trades_24h', (select count(*) from public.cx_trades where created_at > now() - interval '24 hours'),
    'volume_24h', (select coalesce(sum(price * qty), 0) from public.cx_trades where created_at > now() - interval '24 hours'),
    'open_orders', (select count(*) from public.cx_orders where status = 'open'),
    'user_coins', (select coalesce(jsonb_agg(jsonb_build_object('symbol', symbol, 'name', name, 'created_at', created_at, 'halted', halted,
                     'creator', (select email from auth.users where id = creator)) order by created_at desc), '[]')
                   from public.cx_assets where kind = 'user'),
    -- solvency check: for every asset, the sum of all balances must equal what entered the exchange
    'books_balance', (select coalesce(bool_and(ok), true) from (
        select b.asset, sum(b.available + b.locked) = coalesce((select sum(delta) from public.cx_ledger l where l.asset = b.asset and reason in ('claim', 'mint', 'house')), 0) ok
          from public.cx_balances b group by b.asset) t)
  );
end $$;
revoke all on function public.cx_admin_overview(), public.cx_admin_liquidity(text, numeric, int, numeric, numeric),
  public.cx_admin_halt(text, boolean), public.cx_set_mode(text, text) from public, anon;
grant execute on function public.cx_admin_overview(), public.cx_admin_liquidity(text, numeric, int, numeric, numeric),
  public.cx_admin_halt(text, boolean), public.cx_set_mode(text, text) to authenticated;
