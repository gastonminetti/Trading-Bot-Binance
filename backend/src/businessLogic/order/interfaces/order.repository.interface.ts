// Order repository interface
import { FilterQuery } from 'mongoose';
import { Order } from '../entity/order.entity';
import { OrderMongo } from 'src/dataAccess/Schemas/order/order.schema';

export interface OrderRepositoryInterface {
  insert(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findMany(filter: FilterQuery<OrderMongo>): Promise<Order[]>;
  update(id: string, order: Partial<Order>): Promise<void>;
  // ...other methods as needed
}
