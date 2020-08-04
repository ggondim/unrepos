const { EJSON, ObjectId } = require('bson');

// const teste = new MongoDbRepository({
//   prepareValidator: (repository) => {
//     const ajv = new Ajv(repository.schema, options);
//     const validate = ajv.compile(ajv);
//     return (object) => {
//       const isValid = validate(object);
//       if (!isValid) {
//         return validate.errors;
//       }
//     };
//   },
//   prepareSchema: async (repository) => {
//     return RefParser.$dereference(repository.schema)
//   }
// })

/*
FEATURES:
* Multiple client/db/collection initialization options
* EJSON serialization/deserialization
* Schema validation
* Result cleaning (deletes results properties)
* Relationships
*/

class MongoDbRepository {
  constructor(collection, {
    db,
    mongoClient,
    connectionString,
    dbName,
    schema,
    prepareValidator,
    validator,
    schemaCollectionName = 'name',
    ejson = false,
    ejsonOptions = { relaxed: true },
    cleanResults,
    prepareSchema,
    defaultIdField = '_id',
    relationships,
    convertSubdocumentsToIds = true,
    MongoClient,
  } = {}) {
    if (typeof collection === 'object') {
      this.collection = collection;
    } else if (typeof collection === 'string') {
      // should initialize collection
      this.initializeCollection = collection;
    } else if (!collection && typeof schema === 'object') {
      // should infer collection from schema
      this.initializeCollection = schema[schemaCollectionName];
    } else {
      throw new TypeError();
    }

    if (typeof db === 'object' && db.collection) {
      this.db = db;
    } else if (typeof db === 'function' || (AsyncFunction && db instanceof AsyncFunction)) {
      this.initializeDb = db;
    } else if (typeof mongoClient === 'object' && mongoClient.db && typeof dbName === 'string') {
      this.client = mongoClient;
      this.initializeDbName = dbName;
      // should initialize db
    } else if (typeof connectionString === 'string' && typeof dbName === 'string') {
      // should initialize client and db
      this.initializeClient = connectionString;
      this.initializeDbName = dbName;
      let client;
      if (typeof require === 'function') {
        client = require('mongodb').MongoClient;
      }
      this.MongoClient = MongoClient || client;
    } else {
      throw new TypeError();
    }

    if (schema) {
      this.schema = schema;
    }
    if (cleanResults) {
      this.cleanResults = cleanResults;
    }
    if (prepareSchema) {
      this.initializeSchema = prepareSchema;
    }
    if (relationships) {
      this.relationships = relationships;
    }
    if (prepareValidator) {
      this.initializeValidator = prepareValidator;
    } else if (validator) {
      this.validator = validator;
    }

    this.ejson = ejson;
    this.ejsonOptions = ejsonOptions;
    this.defaultIdField = defaultIdField;
    this.convertSubdocumentsToIds = convertSubdocumentsToIds;
  }

  static async dbClose(mongoClient) {
    if (!mongoClient
        || !mongoClient.isConnected
        || !mongoClient.isConnected()
        || !mongoClient.close
    ) return null;
    return mongoClient.close();
  }

  static toObjectId(id) {
    if (id instanceof ObjectId) {
      return id;
    } else if (typeof id === 'string') {
      return ObjectId.createFromHexString(id);
    } else if (typeof id === 'object' && id.$oid) {
      return ObjectId.createFromHexString(id.$oid);
    }
    throw new TypeError();
  }

  static fromObjectId(id) {
    if (typeof id === 'string') {
      return id;
    } else if (id instanceof ObjectId) {
      return id.toHexString();
    } else if (typeof id === 'object' && id.$oid) {
      return id.$oid;
    }
    throw new TypeError();
  }

  static async create(collection, document) {
    return collection.insertOne(document);
  }

  static async get(collection, id, fields) {
    return MongoDbRepository.list(collection, {
      filter: { _id: MongoDbRepository.toObjectId(id) },
      fields,
    });
  }

  static async list(collection, {
    pipeline = [],
    fields,
    sort,
    filter,
    limit,
    offset,
    returnCount,
  } = {}) {
    const _pipeline = pipeline;

    if (filter) {
      _pipeline.push({ $match: filter });
    }

    if (sort) {
      const $sort = sort.split(',').reduce((acc, field) => {
        if (field.startsWith('-')) {
          acc[field.substr(1)] = -1;
        } else {
          acc[field] = 1;
        }
        return acc;
      }, {});
      _pipeline.push({ $sort });
    }

    if (fields) {
      const $project = fields.split(',').reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});
      _pipeline.push({ $project });
    }

    if (limit && offset && !returnCount) {
      if (typeof limit !== 'number') limit = parseInt(limit);
      if (typeof offset !== 'number') offset = parseInt(offset);
      _pipeline.push({ $skip: offset }, { $limit: limit });
    }

    if (returnCount) {
      _pipeline.push({ $count: 'count' });
    }

    return collection.aggregate(_pipeline).toArray();
  }

  static async update(collection, id, patch, {
    isMongoUpdate = false,
  } = {}) {
    const operators = isMongoUpdate ? patch : { $set: patch };
    if (operators.$set._id) {
      Reflect.deleteProperty(operators.$set, '_id');
    }
    return collection.updateOne({ _id: MongoDbRepository.toObjectId(id) }, operators);
  }

  static async remove(collection, id) {
    return collection.deleteOne({ _id: MongoDbRepository.toObjectId(id) });
  }

  static async query(collection, pipeline) {
    return collection.aggregate(pipeline).toArray();
  }

  static async distinctValues(collection, field) {
    return collection.aggregate([{
      $group: { _id: `$${field}` }
    }, {
      $project: {
        _id: 0,
        value: `$_id`,
      }
    }]);
  }

  static serializedResult(result, shouldSerialize = false, ejsonOptions = {}) {
    if (shouldSerialize) {
      return EJSON.serialize(result, ejsonOptions);
    }
    return result;
  }

  static deserializedInput(input, shouldSerialize = false, ejsonOptions = {}) {
    if (shouldSerialize) {
      return EJSON.deserialize(input, ejsonOptions);
    }
    return input;
  }

  static cleanProperties(object, props) {
    props.forEach(prop => {
      Reflect.deleteProperty(object, prop);
    });
    return object;
  }

  static cleanResult(result, toClean) {
    if (toClean && toClean.length) {
      return MongoDbRepository.cleanProperties(result, toClean);
    }
    return result;
  }

  static validateInput(input, validator) {
    if (validator) {
      const errors = validator(document);
      if (errors && errors.length) {
        const error = new Error('VALIDATION_ERROR');
        error.validationErrors = errors;
        throw error;
      }
    }
    return input;
  }

  static subdocumentsToIds(document, defaultIdField) {
    // create, update
    Object.keys(document).forEach((prop) => {
      const subdocument = document[prop];
      const type = typeof subdocument;
      if (type === 'object' && subdocument[defaultIdField]) {
        document[prop] = subdocument[defaultIdField];
      } else if (type === 'object' && !Array.isArray(subdocument)) {
        document[prop] = MongoDbRepository.subdocumentsToIds(subdocument, defaultIdField);
      } else if (Array.isArray(subdocument)) {
        document[prop] = subdocument
          .map(x => MongoDbRepository.subdocumentsToIds(x, defaultIdField));
      }
    })
  }

  static relationshipsToLookups(relationships, defaultIdField) {
    return Object
      .keys(relationships)
      .map((field) => {
        const { schema, cardinality } = relationships[field];
        const pipeline = [{
          $lookup: {
            from: schema.name,
            localField: field,
            foreignField: defaultIdField,
            as: field,
          },
        }];
        if (cardinality === 'many') {
          pipeline.push({
            $unwind: {
              path: field,
              preserveNullAndEmptyArrays: true,
            }
          });
        }
        return pipeline;
      })
      .reduce((a, b) => [...a, ...b], []);
  }

  static injectRelationshipsPipeline(options, operations = {}) {
    if (options
      && (
        (options.schema && options.schema.relationships)
        || options.relationships
      )
    ) {
      const pipeline = MongoDbRepository.relationshipsToLookups(
        options.schema.relationships || options.relationships,
        options.defaultIdField,
      );
      if (!operations.pipeline) operations.pipeline = [];
      operations.pipeline = [...operations.pipeline, ...pipeline];
    }
  }

  static injectSubdocumentsIds(document, options) {
    if (options && options.convertSubdocumentsToIds) {
      MongoDbRepository.subdocumentsToIds(document, options.defaultIdField);
    }
  }

  get pendingInitialization() {
    return this.initializeDb
      || this.initializeClient
      || this.initializeDbName
      || this.initializeCollection
      || this.initializeSchema
      || this.initializeValidator;
  }
  set pendingInitialization(value) {
    if (value === false) {
      this.initializeClient = false;
      this.initializeDbName = false;
      this.initializeCollection = false;
      this.initializeSchema = false;
      this.initializeValidator = false;
    }
  }

  async initialize() {
    if (!this.pendingInitialization) return;
    if (this.initializeDb) {
      this.db = await (async () => this.initializeDb())();
    }
    if (this.initializeClient) {
      this.client = await this.MongoClient.connect(this.initializeClient);
    }
    if (this.client && this.initializeDbName) {
      this.db = this.client.db(this.initializeDbName);
    }
    if (this.initializeCollection) {
      this.collection = this.db.collection(this.initializeCollection);
    }
    if (this.initializeSchema) {
      this.schema = await (async () => this.initializeSchema(this))();
    }
    if (this.initializeValidator) {
      this.validator = await (async () => this.initializeValidator(this))();
    }
    this.pendingInitialization = false;
  }

  async dispose() {
    return MongoDbRepository.dbClose(this.client);
  }

  async create(document, options = {}) {
    await this.initialize();
    const _options = { ...options, ...this };
    let _doc = MongoDbRepository.deserializedInput(document, _options.ejson, _options.ejsonOptions);
    MongoDbRepository.injectSubdocumentsIds(document, options);
    _doc = MongoDbRepository.validateInput(document, _options.validator);
    let result = await MongoDbRepository.create(_options.collection, _doc);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, _options.ejson, _options.ejsonOptions);
  }

  async get(id, options = {}) {
    const _options = { ...options, ...this };
    const filter = {};
    filter[_options.defaultIdField] = MongoDbRepository.toObjectId(id);
    return this.list({ filter }, options);
  }

  async list(operations = {}, options = {}) {
    // TODO: deserialize operations
    await this.initialize();
    const _options = { ...options, ...this };
    const _operations = { ...operations };
    MongoDbRepository.injectRelationshipsPipeline(_options, _operations);
    let result = await MongoDbRepository.list(_options.collection, _operations);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, _options.ejson, _options.ejsonOptions);
  }

  async update(id, patch, options = {}) {
    await this.initialize();
    const _options = { ...options, ...this };
    let _patch = MongoDbRepository.deserializedInput(patch, _options.ejson, _options.ejsonOptions);
    MongoDbRepository.injectSubdocumentsIds(document, options);
    if (_options.isMongoUpdate) {
      // TODO: find a way to validate patches
    } else {
      _patch = MongoDbRepository.validateInput(document, _options.validator);
    }
    let result = await MongoDbRepository.update(_options.collection, id, _patch, options);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, ejson, _options.ejsonOptions);
  }

  async remove(id, options = {}) {
    await this.initialize();
    const _options = { ...options, ...this };
    let result = MongoDbRepository.remove(_options.collection, id);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, _options.ejson, _options.ejsonOptions);
  }

  async distinctValues(field, options = {}) {
    await this.initialize();
    const _options = { ...options, ...this };
    let result = MongoDbRepository.distinctValues(_options.collection, field);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, _options.ejson, _options.ejsonOptions);
  }

  async query(pipeline, options = {}) {
    // TODO: deserialize pipeline
    await this.initialize();
    const _options = { ...options, ...this };
    let result = await MongoDbRepository.list(_options.collection, pipeline);
    result = MongoDbRepository.cleanResult(result, _options.cleanResults);
    return MongoDbRepository.serializedResult(result, _options.ejson, _options.ejsonOptions);
  }
}

module.exports = MongoDbRepository;
