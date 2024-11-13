export class CrudOperationResult {
  matchedCount?: number;

  modifiedCount?: number;

  constructor(
    public readonly rawResult: object | null,
  ) { }
}
