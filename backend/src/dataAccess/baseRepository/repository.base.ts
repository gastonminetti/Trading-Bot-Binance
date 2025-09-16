import { Model, Document, FilterQuery, Query, UpdateQuery } from 'mongoose';
import { IRepository } from './repository.interface';

export abstract class baseRepository<TDoc extends Document>
  implements IRepository<TDoc>
{
  protected constructor(protected readonly model: Model<TDoc>) {}

  async insertRecord(doc: Partial<TDoc>): Promise<TDoc> {
    return this.model.create(doc as any);
  }

  async findEntityById(id: string): Promise<TDoc | null> {
    return this.model.findById(id).exec();
  }

  async findManyEntities(
    filter: FilterQuery<TDoc> = {} as FilterQuery<TDoc>,
  ): Promise<TDoc[]> {
    return this.model.find(filter).exec();
  }

  async update(id: string, patch: Partial<TDoc>): Promise<void> {
    await this.model
      .updateOne({ _id: id } as FilterQuery<TDoc>, {
        $set: patch as UpdateQuery<TDoc>,
      })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id } as FilterQuery<TDoc>).exec();
  }

  protected toLeanMany<TRecord>(
    query: Query<TDoc[], TDoc>,
  ): Promise<TRecord[]> {
    return query.lean<TRecord[]>().exec();
  }

  protected toLeanOne<TRecord>(
    query: Query<TDoc | null, TDoc>,
  ): Promise<TRecord | null> {
    return query.lean<TRecord | null>().exec();
  }
}
