# mongodb-proper-repository
Unopionated and isomorphic MongoDB repository implementation, with JSON Schema validation, Extended JSON support, automatic relationship links and much more configurable features.

## Features

<dl>
  <dt><b>No dependency of MongoDB Driver 🗽</b></dt>
  <dd>Supports other driver implementations such as MongoDB Stich/Realm (it is really isomorphic), but automatically resolves to MongoDB Driver if you don't specify</dd>
  
  <dt><b>Multiple initialization options 🛠</b></dt>
  <dd>Client, db (object and function) or collection</dd>
  
  <dt><b>Optional EJSON serialization/deserialization 🃏</b></dt>
  <dd>Solves BSON-types serialization problems (like ObjectID and dates) between client-server and helps you make a more isomorphic application</dd>
  
  <dt><b>Unopinionated JSON Schema validation ✔</b></dt>
  <dd>But easy to use with popular valitation libraries, like AJV</dd>
  
  <dt><b>Result cleaning 🧹</b></dt>
  <dd>Deletes specified results properties, such as database connections, to safe-return them in APIs' endpoints</dd>
  
  <dt><b>Relationships! 🔗</b></dt>
  <dd>Automatic conversion of documents into ObjectIDs (FKs) when writing data and automatic relationship population when retrieving data </dd>
  
  <dt><b>Promises, promises everywhere ⏳</b></dt>
  <dd>Stop promisifying callbacks, we are in 21th century</dd>
  
  <dt><b>Primarily object-oriented, but also with functional support 🧩</b></dt>
  <dd>Main JavaScript class exposes static functions</dd>
  
  <dt><b>Indexes from JSON Schema (coming soon) 🚧</b></dt>
  <dd>Automatic and non-blocking index assurance inferred by schemas</dd>
</dl>

### Example: JSON Schema validation using AJV

```javascript
  prepareValidator: (repository) => {
    const ajv = new Ajv(repository.schema, options);
    const validate = ajv.compile(ajv);
    return (object) => {
      const isValid = validate(object);
      if (!isValid) {
        return validate.errors;
      }
    };
  },
```

### Example: JSON Schema transformation using RefParser

```javascript
  prepareSchema: async (repository) => {
    return RefParser.$dereference(repository.schema)
  }
```

### Ending of mongodb-pro and mongodb-xcollection

From now on, I am archiving and deprecating these old GitHub repositories, since mongodb-proper-repository can be used as a proper replacement for them.

If you were using mongodb-pro to easily create and dispose connections, you can use the new static methods as replacements.

If you were using mongodb-xcollection to automatic EJSON serialization/deserialization, you can also use the new static methods passing `ejson: true` as an option.

These old packages are also deprecated, which means that I will unpublish them from NPM, as their weekly downloads are too low.

I will not support these old packages anymore with new features or fixes. 
