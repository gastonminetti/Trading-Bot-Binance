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


