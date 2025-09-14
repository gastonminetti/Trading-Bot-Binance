import { Model, Document, Query } from 'mongoose';
import { IRepository } from './repository.interface';

export abstract class RepositoryBase<TDoc extends Document>
  implements IRepository<TDoc>
{
  protected constructor(protected readonly model: Model<TDoc>) {}

  async create(doc: Partial<TDoc>): Promise<TDoc> {
    return this.model.create(doc);
  }

  async findById(id: string): Promise<TDoc | null> {
    return this.model.findById(id).exec();
  }

  async find(filter: Record<string, any> = {}): Promise<TDoc[]> {
    return this.model.find(filter).exec();
  }

  async update(id: string, patch: Partial<TDoc>): Promise<void> {
    await this.model.updateOne({ _id: id } as any, { $set: patch }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id } as any).exec();
  }

  protected toLeanMany(query: Query<TDoc[], TDoc>): Promise<Array<any>> {
    return query.lean().exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  protected toLeanOne(query: Query<TDoc | null, TDoc>): Promise<any | null> {
    return query.lean().exec();
  }
}
