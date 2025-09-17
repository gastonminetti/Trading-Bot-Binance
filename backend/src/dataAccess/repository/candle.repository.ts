import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { CandleMongo } from '../Schemas/candle/candle.schema';
import { CandleRecord } from '../Schemas/candle/candle.record';
import { Candle } from '../../businessLogic/candle/entity/candle.entity';
import { CandleInterval } from '../../businessLogic/candle/entity/candleInterval';

import { BaseRepository } from '../baseRepository/repository.base';

@Injectable()
export class CandleRepository extends BaseRepository<CandleMongo> {
  constructor(@InjectModel(CandleMongo.name) model: Model<CandleMongo>) {
    super(model);
  }

  async insert(entity: Candle): Promise<Candle> {
    const created = await this.insertRecord(this.mapEntityToRecord(entity));
    const lean = created.toObject<CandleRecord>();
    return this.mapRecordToEntity(lean);
  }

  // TODO: delete if unnecessary
  /* async insertMany(entities: Candle[]): Promise<void> {
    if (!entities?.length) return;
    const records = entities.map((e) => this.mapEntityToRecord(e));
    await this.model.insertMany(records, { ordered: false });
  } */

  async findById(id: string): Promise<Candle | null> {
    const record = await this.findEntityById(id);
    if (!record) return null;
    return this.mapRecordToEntity(record.toObject<CandleRecord>());
  }

  async findMany(filter: FilterQuery<CandleMongo> = {}): Promise<Candle[]> {
    const records = await this.findManyEntities(filter);
    return records.map((r) =>
      this.mapRecordToEntity(r.toObject<CandleRecord>()),
    );
  }

  async findBySymbolIntervalSince(
    symbol: string,
    interval: CandleInterval,
    fromMs: number,
  ): Promise<Candle[]> {
    const q = this.model
      .find({ symbol, interval, openTime: { $gte: fromMs } })
      .sort({ openTime: 1 });
    const records = await this.toLeanMany<CandleRecord & { _id?: any }>(q);
    return records.map((r) => this.mapRecordToEntity(r));
  }

  async latestClosed(
    symbol: string,
    interval: CandleInterval,
  ): Promise<Candle | null> {
    const q = this.model
      .findOne({ symbol, interval, closed: true })
      .sort({ closeTime: -1 });
    const rec = await this.toLeanOne<CandleRecord & { _id?: any }>(q);
    return rec ? this.mapRecordToEntity(rec) : null;
  }

  async countBySymbol(symbol: string): Promise<number> {
    // could delegate to a base `count` if you add one there
    return this.model.countDocuments({ symbol }).exec();
  }

  protected mapEntityToRecord(entity: Candle): CandleRecord {
    return {
      symbol: entity.symbol,
      interval: entity.interval,
      openTime: entity.openTime,
      closeTime: entity.closeTime,
      openPrice: entity.openPrice,
      highPrice: entity.highPrice,
      lowPrice: entity.lowPrice,
      closePrice: entity.closePrice,
      volume: entity.volume,
      trades: entity.trades,
      closed: entity.closed,
      receivedAt: entity.receivedAt,
    };
  }

  protected mapRecordToEntity(record: CandleRecord): Candle {
    return new Candle(
      record.symbol,
      record.interval,
      record.openTime,
      record.closeTime,
      record.openPrice,
      record.highPrice,
      record.lowPrice,
      record.closePrice,
      record.volume,
      record.trades,
      record.closed,
      record.receivedAt,
      record._id?.toString(),
    );
  }
}
