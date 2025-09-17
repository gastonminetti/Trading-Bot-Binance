// Order record for MongoDB
import { Types } from 'mongoose';
import { LastError } from 'src/businessLogic/order/entity/lastError';

export interface OrderRecord {
  _id?: Types.ObjectId;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  type: 'MARKET' | 'LIMIT';
  price?: number;
  status: string;
  isTest: boolean;
  exchangeOrderId?: string;
  clientOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastError?: LastError;
}
