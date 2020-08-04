interface IRepository {
  new(options?: object);
  initialize(): Promise<void>;
  dispose(): Promise<void>;

  create(document: object, options?: object): Promise<object>;

  get(id, options?: object): Promise<object|null>;

  list(operations?: object, options?: object): Promise<Array<object>|[]>;
  count(operations?: object, options?: object): Promise<Array<object>|[]>;
  distinctValues(field: string, options?: object): Promise<Array<object>|[]>;
  query(queryLike, options?: object): Promise<Array<object>|[]>;

  update(id, operation: object, options?: object): Promise<object>;
  replace(id, document: object, options?: object): Promise<object>;
  patch(id, patch: object, options?: object): Promise<object>;

  remove(id, options?: object): Promise<boolean|void>;
}
