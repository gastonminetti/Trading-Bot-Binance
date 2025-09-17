import { LastError } from './lastError';

export class Order {
  constructor(
    public readonly symbol: string,
    public readonly side: 'BUY' | 'SELL',
    public readonly quantity: number,
    public readonly type: 'MARKET' | 'LIMIT',
    public readonly price: number,
    public status: string, // TODO: Change to enum
    public readonly isTest: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly exchangeOrderId?: string,
    public readonly clientOrderId?: string,
    public readonly lastError?: LastError,
    public readonly id?: string,
  ) {}
}
