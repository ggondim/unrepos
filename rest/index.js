// TODO: return responses alongside deserialized bodies

class RestRepository {
  constructor({
    resourceName,
    baseUrl,
    credentials,
    schema,
    prepareValidator,
    validator,
    schemaResourceName = 'name',
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    fetchApi = fetch,
  }) {
    this.baseUrl = baseUrl;
    this.serializer = serializer;
    this.deserializer = deserializer;
    this.fetchApi = fetchApi;

    if (schema) {
      this.schema = schema;
    }

    if (prepareValidator) {
      this.initializeValidator = prepareValidator;
    } else if (validator) {
      this.validator = validator;
    }

    if (!resourceName && schema) {
      // should infer collection from schema
      this.resourceName = schema[schemaResourceName];
    } else {
      this.resourceName = resourceName;
    }
  }

  get pendingInitialization() {
    return this.initializeValidator;
  }
  set pendingInitialization(value) {
    if (value === false) {
      this.initializeValidator = false;
    }
  }

  get resourceUrl() {
    return `${this.baseUrl}/${this.resourceName}`;
  }

  async initialize() {
    if (!this.pendingInitialization) return;
    if (this.initializeValidator) {
      this.validator = await (async () => this.initializeValidator(this))();
    }
    this.pendingInitialization = false;
  }

  async dispose() {
    return; // noop
  }

  async request(options, path = '') {
    const _options = { ...options };

    _options.headers = new Headers(_options.headers || {});
    if (!_options.headers.has('Accept')) {
      method,
      _options.headers.set('Accept', 'application/json');
    }

    if (options.body) {
      _options.body = this.serializer(_doc);
    }

    let query = '';
    if (options.query) {
      const serializedQuery = Object
        .keys(options.query)
        .reduce((q, key) => {
          const value = options.query[key];
          q[key] = typeof value == 'object' ? this.serializer(value) : value;
          return q;
        }, {})
      query = '?' + new URLSearchParams(serializedQuery).toString();
    }

    const requestUrl = `${this.resourceUrl}${path}${query}`;
    const response = await this.fetchApi(requestUrl, _options);
    const body = response.text();
    return this.deserializer(body);
  }

  async create(document, options = {}) {
    await this.initialize();
    options.method = options.method || 'POST';
    options.body = await RestRepository.validateInput(document, options.validator);
    return this.request(options);
  }

  async get(id, options = {}) {
    await this.initialize();
    options.method = options.method || 'GET';
    return this.request(options, `/${id}`);
  }

  async list(operations = {}, options = {}) {
    await this.initialize();
    options.method = options.method || 'GET';
    options.query = operations;
    return this.request(options);
  }

  async update(id, operation, options = {}) {
    await this.initialize();

    let toUpdate = operation;
    if (_options.patch) {
      // TODO: find a way to validate patches
    } else {
      toUpdate = RestRepository.validateInput(operation, _options.validator);
    }

    options.method = options.method || (options.patch ? 'PATCH' : 'POST');
    options.body = toUpdate;
    return this.request(options);
  }

  async patch(id, patch, options = {}) {
    return this.update(id, patch, { ...options, patch: true });
  }

  async replace(id, document, options = {}) {
    return this.update(id, document, options);
  }

  async remove(id, options = {}) {
    await this.initialize();
    options.method = options.method || 'DELETE';
    return this.request(options, `/${id}`);
  }

  async distinctValues(field, options = {}) {
    await this.initialize();
    options.method = options.method || 'GET';
    options.query = { field };
    return this.request(options, `/distinct`);
  }

  async query(queryLike, options = {}) {
    await this.initialize();
    options.method = options.method || 'POST';
    options.body = queryLike;
    return this.request(options, '/query');
  }
}
