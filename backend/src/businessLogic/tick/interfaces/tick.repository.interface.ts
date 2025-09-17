import { FilterQuery } from 'mongoose';
import { Tick } from '../entity/tick.entity';
import { TickMongo } from 'src/dataAccess/Schemas/tick/tick.schema';

export interface ITickRepository {
  insert(tick: Tick): Promise<Tick>;
  insertMany(ticks: Tick[]): Promise<void>;
  findById(id: string): Promise<Tick | null>;
  findMany(filter: FilterQuery<TickMongo>): Promise<Tick[]>;
  countBySymbol(symbol: string): Promise<number>;
}
