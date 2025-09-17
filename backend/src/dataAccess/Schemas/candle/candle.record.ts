import { Types } from 'mongoose';
import { CandleInterval } from '../../../businessLogic/candle/entity/candleInterval';

export interface CandleRecord {
  _id?: Types.ObjectId;
  symbol: string;
  interval: CandleInterval;
  openTime: number;
  closeTime: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  trades: number;
  closed: boolean;
  receivedAt: number;
}
