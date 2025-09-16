import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { TickMongo } from '../Schemas/tick/tick.schema';
import { TickRecord, NewTickRecord } from '../Schemas/tick/tick.record';
import { Tick } from '../../businessLogic/tick/entity/tick.entity';

import { BaseRepository } from '../baseRepository/repository.base';
import { ITickRepository } from '../../businessLogic/tick/interfaces/tickRepository.interface';

@Injectable()
export class TickRepository
  extends BaseRepository<TickMongo>
  implements ITickRepository
{
  constructor(@InjectModel(TickMongo.name) model: Model<TickMongo>) {
    super(model);
  }

  async insert(entity: Tick): Promise<Tick> {
    const created = await this.insertRecord(this.mapEntityToRecord(entity));
    const lean = created.toObject<TickRecord>();
    return this.mapRecordToEntity(lean);
  }

  async insertMany(entities: Tick[]): Promise<void> {
    if (!entities?.length) return;
    const records = entities.map((e) => this.mapEntityToRecord(e));
    await this.model.insertMany(records, { ordered: false });
  }

  async findById(id: string): Promise<Tick | null> {
    const record = await this.findEntityById(id);
    if (!record) return null;
    const rec = record.toObject<TickRecord>();
    return this.mapRecordToEntity(rec);
  }

  async findMany(filter: FilterQuery<TickMongo> = {}): Promise<Tick[]> {
    const records = await this.findManyEntities(filter);
    return records.map((r) => this.mapRecordToEntity(r.toObject<TickRecord>()));
  }

  async countBySymbol(symbol: string): Promise<number> {
    return this.model.countDocuments({ symbol }).exec();
  }

  protected mapEntityToRecord(e: Tick): NewTickRecord {
    return {
      symbol: e.symbol,
      price: e.price,
      eventTime: e.eventTime,
      receivedAt: e.receivedAt,
    };
  }

  protected mapRecordToEntity(r: TickRecord): Tick {
    return new Tick(
      r.symbol,
      r.price,
      r.eventTime,
      r.receivedAt,
      r._id?.toString(),
    );
  }
}
