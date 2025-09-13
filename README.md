# Trading-Bot-Binance

## Configuration

This project follows the 12-factor app principle: all environment-specific values come from environment variables, never hard-coded.
A .env.example file is included with all required keys. Copy it to .env and fill in your own values.

Default mode is Binance Testnet (TRADING_MODE=test) with trading disabled (IS_ENABLED=false) to ensure safety.

To run against live Binance, you must explicitly switch TRADING_MODE=live, update BINANCE_*_URL to production endpoints, and set IS_ENABLED=true.

A global kill switch exists: set IS_ENABLED=false at any time to stop all trading logic.

The full configuration matrix below shows every variable with example values for local, testnet, and live environments.

| Variable                       | Local (dev)                       | Testnet (safe default)            | Live (production)                  | Description                                                                         |
| ------------------------------ | --------------------------------- | --------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| **APP\_NAME**                  | `trading-bot`                     | `trading-bot`                     | `trading-bot`                      | Name shown in logs/metrics.                                                         |
| **APP\_ENV**                   | `local`                           | `testnet`                         | `live`                             | Human-readable environment label.                                                   |
| **LOG\_LEVEL**                 | `debug`                           | `info`                            | `warn`                             | Verbosity of logs.                                                                  |
| **IS\_ENABLED**                | `false`                           | `true`                            | `false` (enable manually)          | Global kill switch; stops trading if `false`.                                       |
| **TRADING\_MODE**              | `paper`                           | `test`                            | `live`                             | `paper`: simulate orders locally. `test`: call Binance testnet. `live`: real funds. |
| **ALLOWED\_SYMBOLS**           | `BTCUSDT,ETHUSDT`                 | `BTCUSDT`                         | `BTCUSDT,ETHUSDT`                  | Comma-separated list of tradable pairs.                                             |
| **TIMEZONE**                   | `UTC`                             | `UTC`                             | `UTC`                              | Used for candle aggregation and logs.                                               |
| **MONGO\_URI**                 | `mongodb://localhost:27017`       | `mongodb+srv://…`                 | `mongodb+srv://…`                  | Connection string to MongoDB.                                                       |
| **MONGO\_DB\_NAME**            | `tradingbot_dev`                  | `tradingbot`                      | `tradingbot`                       | Database name.                                                                      |
| **BINANCE\_API\_KEY**          | `__dummy__`                       | `your_testnet_key`                | `your_live_key`                    | Binance API key (testnet vs live).                                                  |
| **BINANCE\_API\_SECRET**       | `__dummy__`                       | `your_testnet_secret`             | `your_live_secret`                 | Binance API secret (testnet vs live).                                               |
| **BINANCE\_BASE\_URL**         | `https://testnet.binance.vision`  | `https://testnet.binance.vision`  | `https://api.binance.com`          | REST endpoint.                                                                      |
| **BINANCE\_WS\_URL**           | `wss://testnet.binance.vision/ws` | `wss://testnet.binance.vision/ws` | `wss://stream.binance.com:9443/ws` | WebSocket endpoint.                                                                 |
| **WS\_RECONNECT\_MS**          | `3000`                            | `3000`                            | `3000`                             | Reconnect delay when WS drops (ms).                                                 |
| **CANDLES\_INTERVALS**         | `1m`                              | `1m,5m`                           | `1m,5m`                            | Candle aggregation intervals.                                                       |
| **RISK\_MAX\_ORDER\_SIZE**     | `0.002`                           | `0.002`                           | `0.001`                            | Max order size per symbol (in base asset).                                          |
| **RISK\_MAX\_DAILY\_NOTIONAL** | `200`                             | `200`                             | `100`                              | Max USD-equivalent exposure per day.                                                |

# Data Model – Trading Bot

This segment defines the MongoDB data model for the Trading Bot project.  
It explains what each collection stores, which fields are required, what indexes ensure performance/uniqueness, and how long data should be retained.

---

## 1. `ticks` – Raw Market Data
- **Purpose:** High-frequency raw tick data ( miniTicker/trade stream).
- **Fields:**
  - `symbol` – trading pair (e.g., `BTCUSDT`)
  - `price` – last traded price
  - `eventTime` – exchange event time (ms epoch)
  - `receivedAt` – ingestion time (ms epoch)
- **Indexes:**
  - Compound: `(symbol, eventTime)`
  - TTL on `receivedAt` (14 days)
- **Retention:** 14 days (auto-expire)
- **Notes:** Consider time-series collection if MongoDB ≥ 5.0.

---

## 2. `candles` – OHLCV (Open/High/Low/Close/Volume)
- **Purpose:** Aggregated market data for indicators.
- **Fields:**
  - `symbol`
  - `interval` – e.g., `1m`, `5m`
  - `openTime`, `closeTime`
  - `open`, `high`, `low`, `close`
  - `volume`
- **Indexes:**
  - Unique: `(symbol, interval, openTime)`
- **Retention:** 6 months (1m), 12 months (5m+)
- **Notes:** Decide whether to insert “empty” candles on gaps.

---

## 3. `signals` – Strategy Decisions
- **Purpose:** Records every BUY/SELL decision.
- **Fields:**
  - `symbol`
  - `type` – `BUY` | `SELL`
  - `reason` – explanation (e.g., SMA crossover)
  - `price`
  - `eventTime`
  - `strategyName`
  - `metadata` – freeform JSON (indicator values, thresholds)
- **Indexes:**
  - `(symbol, eventTime)`
  - `(strategyName, eventTime)`
- **Retention:** 12 months
- **Notes:** Enforce idempotency (one signal per candle/strategy).

---

## 4. `orders` – Exchange Interactions
- **Purpose:** Track all requested orders (test/live).
- **Fields:**
  - `symbol`
  - `side` – `BUY` | `SELL`
  - `quantity`
  - `type` – `MARKET` | `LIMIT`
  - `price` (if limit)
  - `status` – internal lifecycle state
  - `isTest` – `true` if `/order/test` endpoint used
  - `exchangeOrderId`, `clientOrderId`
  - `createdAt`, `updatedAt`
  - `lastError`
- **Indexes:**
  - `(symbol, createdAt)`
  - `(status)`
  - `(exchangeOrderId)`
  - `(clientOrderId)`
- **Retention:** 12 months
- **Notes:** Use `clientOrderId` for idempotency.

---

## 5. `positions` – Current Exposure (Optional MVP)
- **Purpose:** Store current holdings per asset.
- **Fields:**
  - `symbol` (or asset, e.g., BTC)
  - `qty`
  - `avgEntryPrice`
  - `realizedPnL`, `unrealizedPnL`
  - `updatedAt`
- **Indexes:**
  - `(symbol)`
- **Retention:** Keep latest only (or snapshot history for 6 months).

---

## 6. `botConfig` – Runtime Control
- **Purpose:** Central configuration for the bot.
- **Fields:**
  - `isEnabled` – kill switch
  - `tradingMode` – `paper` | `test` | `live`
  - `allowedSymbols`
  - `riskLimits` – `{ maxNotionalPerDay, maxOrderSize }`
  - `killSwitchReason`
  - Optional: `botId`
- **Indexes:**
  - Fixed `_id` if single bot
  - `(botId)` if multi-bot
- **Retention:** Keep current only; audit separately if needed.

---

## 7. `runLogs` / `errorLogs` – Operational Logs
- **Purpose:** Structured logging for observability.
- **Fields:**
  - `level` – `DEBUG` | `INFO` | `WARN` | `ERROR`
  - `message`
  - `context` – e.g., `{ module, symbol }`
  - `correlationId`
  - `timestamp`
  - `details`
- **Indexes:**
  - `(timestamp)`
  - `(level, timestamp)`
- **Retention:** 30–90 days (or export to external log system)

---

## Retention Policy (Summary)
- `ticks`: 14 days
- `candles`: 6–12 months
- `signals`: 12 months
- `orders`: 12 months
- `positions`: latest only (or 6 months if snapshots)
- `runLogs` / `errorLogs`: 30–90 days
- `botConfig`: current only

---

## Time Granularity
- Initial support: `1m` candles
- Future: add `5m`+ derived intervals
- Align to exact minute boundaries (`eventTime - (eventTime % 60000)`)

---

## Data Lifecycle
1. **Auto-expire** via TTL indexes for high-frequency collections (`ticks`, `logs`).
2. **Archival** for longer-term analytics (export to object storage, e.g., CSV/Parquet).
3. **Backups** via MongoDB Atlas or equivalent.
4. **Schema evolution**: additive, backward-compatible (avoid destructive changes).

---

✅ With this design you can answer:
- Where is X stored?  
- How long do we keep Y?  
- Which indexes guarantee performance and uniqueness?  




















# TODOs

Thought for 10s

Great question. Short answer: define the base “spine” first, then plug Binance real-time data into it. You don’t need full user-defined strategies now, but you should define a tiny Strategy interface so you won’t refactor later.

Here’s the order I recommend (tight, practical milestones):

0) Foundations (1–2 hours)

Env & config: .env, .env.example, config service, switch testnet/live.

Collections & types (Mongo + TS types): BotConfig, Tick, Candle, Signal, Order, Position, RunLog.

Interfaces (keep it thin):

IExchange (subscribe, placeOrderTest, getExchangeInfo, getBalances…)

IStrategy (onTick and/or onCandle → returns Signal | null)

IRiskManager (validate(orderRequest) → approved/rejected with reason)

You’ll implement dummies now, but the contracts remain when you add real logic later.

1) Market Data Ingestion (Binance WS)

Implement BinanceSpotAdapter (WS miniTicker or trade stream).

Reconnect with backoff; heartbeat check.

Persist ticks (batch insert or throttled) and emit to Strategy engine.

Add a candle aggregator (60s/5m) from ticks now—you’ll need candles for real indicators later.

Acceptance check: ticks grows; candles (e.g., 1m) roll correctly; service auto-recovers after WS drop.

2) Strategy Engine (minimal, but keep the interface)

Create a dummy strategy that implements IStrategy (e.g., threshold or 2-SMA on 1m candles).

On signal: persist to signals and publish an app event (don’t trade yet).

Acceptance check: You can see BUY/SELL signals appear under predictable conditions.

3) Risk & Execution (testnet-safe)

Implement RiskManager with basic guards: max position size, per-day notional cap, kill-switch flag in BotConfig.

Implement ExecutionService using /api/v3/order/test only.

Wire: strategy → risk → (if approved) execution TEST endpoint → log to orders with isTest=true.

Acceptance check: A generated signal triggers a test order when within limits; risk rejects when limits exceeded.

4) Observability & Ops

/health endpoint: WS connected? Mongo ok? last tick age?

/status endpoint: current config (read-only), last candle, open positions (simulated).

Structured logging (requestId), and simple metrics (ticks/sec, orders_test_count).

Acceptance check: From a browser or curl you can verify the bot’s health and status.

Why not full user strategies now?

You’ll move faster by locking the contracts (interfaces + data model) and proving the data/flow.

Later, user strategies can persist in BotConfig (per-bot JSON) and be loaded into a StrategyFactory, without changing ingestion/execution/risk.

Minimal code contracts (copy/paste as stubs)
// domain/contracts.ts
export type SignalType = 'BUY' | 'SELL';
export type TickEvt = { symbol: string; price: number; ts: number };
export type CandleEvt = { symbol: string; open:number; high:number; low:number; close:number; volume:number; openTime:number; closeTime:number };

export interface IStrategy {
  onTick?(t: TickEvt): Promise<SignalType | null>;
  onCandle?(c: CandleEvt): Promise<SignalType | null>;
  name: string;
}

export interface IExchange {
  subscribeTicks(symbol: string, onTick: (t: TickEvt)=>void): () => void; // returns unsubscribe
  placeOrderTest(args: {symbol:string; side:SignalType; qty:number; type?:'MARKET'|'LIMIT'; price?:number}): Promise<any>;
}

export interface IRiskManager {
  validate(order: {symbol:string; side:SignalType; qty:number; price?:number}): Promise<{ok:true}|{ok:false; reason:string}>;
}

TL;DR next actions for you today

Create the contracts & Mongo schemas (ticks, candles, signals, orders, botConfig).

Build Binance WS ingestion + candle aggregator.

Add a dummy strategy implementing IStrategy (threshold or SMA).

Wire a RiskManager and ExecutionService (test orders only).

Add /health and /status endpoints.

If you want, I can give you the candle aggregator snippet (from ticks to 1-minute OHLCV) and a tiny 2-SMA strategy that already plugs into these interfaces.