import { JsonOrString } from 'ts-advanced-types';

export type PreferReturn = 'representation' | 'minimal';
export type PreferHandling = 'strict' | 'lenient';
export type ClientAsyncability = 'sync' | 'async' | 'both';

export type CrudOperationListOptions = {
  filter?: JsonOrString,
  sort?: string,
  fields?: string,
  skip?: number,
  limit?: number,
} & CrudOperationOptions;

export type CrudOperationOptions = {
  preferReturn: PreferReturn,
  preferHandling: PreferHandling,
  asyncability: ClientAsyncability,
  expectCount?: number,
};
