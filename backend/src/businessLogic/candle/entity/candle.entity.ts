import { CandleInterval } from './candleInterval';

export class Candle {
  constructor(
    public readonly symbol: string,
    public readonly interval: CandleInterval,
    public readonly openTime: number,
    public closeTime: number,
    public openPrice: number,
    public highPrice: number,
    public lowPrice: number,
    public closePrice: number,
    public volume: number,
    public trades: number,
    public closed: boolean,
    public readonly receivedAt: number = Date.now(),
    public readonly id?: string,
  ) {}

  get isClosed() {
    return this.closed;
  }
}
