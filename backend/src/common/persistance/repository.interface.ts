export interface IRepository<T, Create = Partial<T>, Update = Partial<T>> {
  create(doc: Create): Promise<T>;
  findById(id: string): Promise<T | null>;
  find(filter: Record<string, any>): Promise<T[]>;
  update(id: string, patch: Update): Promise<void>;
  delete(id: string): Promise<void>;
}
