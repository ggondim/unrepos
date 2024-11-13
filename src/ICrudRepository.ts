import { Id } from './Id';
import { Patch } from './Patch';
import { JsonOrString, Document } from 'ts-advanced-types';
import { CrudOperationListOptions, CrudOperationOptions } from './types';
import { CrudOperationResult } from './CrudOperationResult';

export interface ICrudRepository {
  list(options: CrudOperationListOptions): Promise<CrudOperationResult>;
  listWithView(view: string, options: CrudOperationListOptions): Promise<CrudOperationResult>;
  listWithQuery(
    query: JsonOrString,
    options: CrudOperationListOptions,
  ): Promise<CrudOperationResult>;

  create(
    document: Document | Document[],
    options: CrudOperationOptions
  ): Promise<CrudOperationResult>;

  get(id: Id, options: CrudOperationOptions): Promise<CrudOperationResult>;

  patchWithId(
    id: Id,
    patch: Patch,
    options: CrudOperationOptions,
  ): Promise<CrudOperationResult>;
  patchWithFilter(
    filter: JsonOrString,
    patch: Patch,
    options: CrudOperationOptions,
  ): Promise<CrudOperationResult>;

  replaceWithId(
    id: Id,
    replacement: Document,
    options: CrudOperationOptions,
  ): Promise<CrudOperationResult>;
  replaceWithFilter(
    filter: JsonOrString,
    replacement: Document,
    options: CrudOperationOptions,
  ): Promise<CrudOperationResult>;

  deleteWithId(id: Id, options: CrudOperationOptions): Promise<CrudOperationResult>;
  deleteWithFilter(
    filter: JsonOrString,
    options: CrudOperationOptions
  ): Promise<CrudOperationResult>;
}
