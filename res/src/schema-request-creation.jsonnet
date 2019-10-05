local link_path() = ( if std.extVar('for-openapi') == "1" then "#/components/schemas/" else "#/definitions/" );
local esqlate_request_creation = {
  type: "object",
  properties: {
    arguments: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_argument" }
    }
  },
  required: [ "arguments" ],
};
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate request creation",
  descrition: "esqlate is a restful SQL service with a nice UI",
  definitions: {

    esqlate_argument: {
      type: "object",
      properties: {
        "name": { "type": "string" },
        "value": {
          anyOf: [
            { type: "number" },
            { type: "string" },
            { type: "integer" },
            { type: "boolean" },
          ]
        }
      },
      additionalProperties: false,
      required: [ "name", "value" ],
    },

    esqlate_request_creation: esqlate_request_creation

  },

} + esqlate_request_creation
