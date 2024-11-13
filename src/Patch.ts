import { Complex, Document } from 'ts-advanced-types';

export type JsonPatchOperation = {
  op: 'add' | 'remove' | 'replace',
  path: string,
  value?: Complex,
};

export type PatchOrSet = JsonPatchOperation[] | Document;

export class Patch {
  patch?: JsonPatchOperation[];

  set?: Document;

  constructor(patchOrSet: PatchOrSet) {
    if (
      !patchOrSet
      || (Array.isArray(patchOrSet) && patchOrSet.length === 0)
      || !Object.keys(patchOrSet).length
    ) {
      throw new Error('Invalid patch or set');
    }

    if (Array.isArray(patchOrSet)) {
      this.patch = patchOrSet;
    } else {
      this.set = patchOrSet;
    }
  }
}
