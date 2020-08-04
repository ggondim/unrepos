# Implementations Conventions

* Resource URLs are in form of `baseUrl` + `/resource`

* Prefered request content-type is `application/json`

* CREATE and LIST operations requests to path `/`

* GET, UPDATE, PATCH, REPLACE and REMOVE operations requests to `/id`, where `id` is the expected param with the same name. As it is concatenated to the URL, must be a value convertable to `string`

* DISTINCT VALUES operation requests to path `/distinct`, passing the `field` parameter as a query parameter

* QUERY operation requests to path `/query`, passing the query as a HTTP body

* COUNT operation requests to path `/count, with the same parameters as LIST operation

* LIST "operations" are serialized as query parameters. If a parameter is an object, the default serializer will be used
