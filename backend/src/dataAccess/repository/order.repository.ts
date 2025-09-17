import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { OrderMongo } from '../Schemas/order/order.schema';
import { OrderRecord } from '../Schemas/order/order.record';

import { BaseRepository } from '../baseRepository/repository.base';
import { OrderRepositoryInterface } from '../../businessLogic/order/interfaces/order.repository.interface';
import { Order } from '../../businessLogic/order/entity/order.entity';

@Injectable()
export class OrderRepository
  extends BaseRepository<OrderMongo>
  implements OrderRepositoryInterface
{
  constructor(@InjectModel(OrderMongo.name) model: Model<OrderMongo>) {
    super(model);
  }

  async insert(entity: Order): Promise<Order> {
    const created = await this.insertRecord(this.mapEntityToRecord(entity));
    const lean = created.toObject<OrderRecord>();
    return this.mapRecordToEntity(lean);
  }

  /* 
  async insertMany(entities: Order[]): Promise<void> {
    if (!entities?.length) return;
    const records = entities.map((e) => this.mapEntityToRecord(e));
    await this.model.insertMany(records, { ordered: false });
  } */

  async findById(id: string): Promise<Order | null> {
    const record = await this.findEntityById(id);
    if (!record) return null;
    return this.mapRecordToEntity(record.toObject<OrderRecord>());
  }

  async findMany(filter: FilterQuery<OrderMongo> = {}): Promise<Order[]> {
    const docs = await this.findManyEntities(filter);
    return docs.map((d) => this.mapRecordToEntity(d.toObject<OrderRecord>()));
  }

  async update(id: string, order: Partial<Order>): Promise<void> {
    const record = this.mapEntityToRecord(order as Order);
    await this.updateEntity(id, record);
  }

  protected mapEntityToRecord(e: Order): OrderRecord {
    return {
      symbol: e.symbol,
      side: e.side,
      quantity: e.quantity,
      type: e.type,
      price: e.price,
      status: e.status,
      isTest: e.isTest,
      exchangeOrderId: e.exchangeOrderId,
      clientOrderId: e.clientOrderId,
      createdAt: e.createdAt ?? new Date(),
      updatedAt: e.updatedAt ?? new Date(),
      lastError: e.lastError
        ? {
            code: e.lastError.code,
            message: e.lastError.message,
            raw: e.lastError.raw,
          }
        : undefined,
    };
  }

  protected mapRecordToEntity(record: OrderRecord): Order {
    const e = new Order(
      record.symbol,
      record.side,
      record.quantity,
      record.type,
      record.price ?? 0, //TODO: throw exception?
      record.status,
      record.isTest,
      record.createdAt,
      record.updatedAt,
      record.exchangeOrderId,
      record.clientOrderId,
      record.lastError
        ? {
            code: record.lastError.code,
            message: record.lastError.message,
            raw: record.lastError.raw,
          }
        : undefined,
      record._id?.toString(),
    );
    return e;
  }
}
