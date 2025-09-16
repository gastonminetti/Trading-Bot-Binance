import { Types } from 'mongoose';

export type TickRecord = {
  _id: Types.ObjectId;
  symbol: string;
  price: number;
  eventTime: number;
  receivedAt: number;
};

export type NewTickRecord = Omit<TickRecord, '_id'>;
