import { Uuid } from '@uuid-ts/uuid';

export enum IdTypes {
  UUID = 'uuid',
  NUMBER = 'number',
  STRING = 'string',
}

export type IdLike = Uuid | number | string;

export class Id<T = IdLike> {
  constructor(public idType: IdTypes, public value: IdLike | T) { }

  static parse<T = IdLike>(id: string): Id<T> {
    const uuid = Uuid.validateUuidString(id);
    if (uuid) return new Id<T>(IdTypes.UUID, uuid);

    if (/^\d+$/.test(id)) return new Id<T>(IdTypes.NUMBER, Number(id));

    return new Id<T>(IdTypes.STRING, id);
  }

  toString(encoding?: BufferEncoding): string {
    if (this.idType === IdTypes.STRING) return this.value as string;
    if (this.idType === IdTypes.NUMBER) return (this.value as number).toString();
    return (this.value as Uuid).toString(encoding);
  }
}
