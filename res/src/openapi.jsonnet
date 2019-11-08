local schemaDefinition = import "./schema-definition.jsonnet";
local schemaRequestCreation = import "./schema-request-creation.jsonnet";
local schemaRequestCreationResponse = import "./schema-request-creation-response.jsonnet";
local schemaRequest = import "./schema-request.jsonnet";
local schemaResult = import "./schema-result.jsonnet";

{
  openapi: "3.0.1",
  info: {
    title: "Esqlate",
    contact: { email: "github.com@speechmarks.com" },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    },
    version: "0.0.1"
  },
  externalDocs: {
    description: "Esqlate Project Homepage",
    url: "http://github.com/forbesmyester/esqlate"
  },
  servers: [{ url: "http://petstore.swagger.io/api/v2" }],
  paths: {
    "/": {
      get: {
        summary: "Gets a list of definition",
        operationId: "list",
        tags: [],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/definition_list"
                }
              }
            }
          }
        }
      }
    },
    "/definition/{definitionName}": {
      get: {
        summary: "Gets a definition",
        operationId: "getDefinition",
        tags: [],
        parameters: [
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_definition"
                }
              }
            }
          }
        }
      }
    },
    "/demand/{definitionName}": {
      post: {
        summary: "Runs a Request now, with Result delivered immediately",
        operationId: "demand",
        parameters: [
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: { "type": "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                "$ref": "#/components/schemas/esqlate_request_creation"
              }
            }
          },
          required: true
        },
        responses: {
          "200": {
            description: "The final results",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_result"
                }
              }
            }
          }
        }
      }
    },
    "/request/{definitionName}": {
      post: {
        summary: "Puts a Request on the queue, which will eventually create Result",
        operationId: "createRequest",
        parameters: [
          {
            name: "x-no-redirect",
            "in": "header",
            description: "If set to true, 200 responses will be sent instead of 301"
          },
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: { "type": "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                "$ref": "#/components/schemas/esqlate_request_creation"
              }
            }
          },
          required: true
        },
        responses: {
          "200": self["301"] + { description: "successful operation with x-no-redirect parameter" },
          "301": {
            description: "successful operation",
            headers: {
              Location: {
                description: "Where to monitor the status of the Request",
                schema: { "type": "string" }
              }
            },
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_request_creation_response"
                }
              }
            }
          }
        }
      }
    },
    "/request/{definitionName}/{requestId}": {
      get: {
        summary: "Gets the details of a Request",
        operationId: "getRequest",
        tags: [],
        parameters: [
          {
            name: "x-no-redirect",
            "in": "header",
            description: "If set to true, 200 responses will be sent instead of 301"
          },
          {
            name: "requestId",
            "in": "path",
            description: "The Id of the Request",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: { "type": "string" }
          }
        ],
        responses: {
          "202": {
            description: "has not been processed yet",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_request"
                }
              }
            }
          },
          "200": self["301"] + { description: "successful operation with x-no-redirect parameter" },
          "301": {
            description: "successful operation",
            headers: {
              Location: {
                description: schemaRequest['definitions']['esqlate_request']['properties']['location']['description'],
                schema: { "type": "string" }
              }
            },
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_request"
                }
              }
            }
          }
        }
      }
		},
    "/result/{definitionName}/{resultId}": {
      get: {
        summary: "Gets the (maybe only some) Results created from a Request",
        operationId: "getResults",
        tags: [],
        parameters: [
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: { "type": "string" }
          },
          {
            name: "resultId",
            "in": "path",
            description: "The Id of the Result",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "The final results",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/esqlate_result"
                }
              }
            }
          }
        }
			}
    },
    "/result/{definitionName}/{resultId}.csv": {
      get: {
        summary: "Gets the (all of the) Results created from a Request in CSV format",
        operationId: "getResults",
        tags: [],
        parameters: [
          {
            name: "definitionName",
            "in": "path",
            description: "Name of the definition",
            required: true,
            schema: { "type": "string" }
          },
          {
            name: "resultId",
            "in": "path",
            description: "The Id of the Result",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "The final results",
            content: { "text/csv": { } }
          }
        }
			}
		}
  },
  components: {
    schemas:
      schemaDefinition['definitions'] +
      schemaRequestCreation['definitions'] +
      schemaRequestCreationResponse['definitions'] +
      schemaRequest['definitions'] +
			schemaResult['definitions'] +
      {
        definition_list: {
            type: "array",
            items: {
              required: [ "title", "name" ],
              properties: {
                "name": { "type": "string" },
                "title": { "type": "string" }
              }
            }
          }
      }
  }
}
