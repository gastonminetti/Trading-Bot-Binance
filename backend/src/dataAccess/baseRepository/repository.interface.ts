export interface IRepository<T, Create = Partial<T>, Update = Partial<T>> {
  insertRecord(doc: Create): Promise<T>;
  findEntityById(id: string): Promise<T | null>;
  findManyEntities(filter: Record<string, any>): Promise<T[]>;
  updateEntity(id: string, patch: Update): Promise<void>;
  delete(id: string): Promise<void>;
}
