local link_path() = ( if std.extVar('for-openapi') == "1" then "#/components/schemas/" else "#/definitions/" );

local error_result = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["error"] },
    message: { type: "string" }
  },
  required: ["status"],
  additionalProperties: false
};

local complete_result = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["complete"] },
    fields: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_field_definition" }
    },
    rows: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_complete_result_row" }
    }
  },
  required: ["status", "fields", "rows"],
  additionalProperties: false
};

local result = {
  oneOf: [
    { "$ref": link_path() + "esqlate_complete_result" },
    { "$ref": link_path() + "esqlate_error_result" }
  ],
  discriminator: {
    propertyName: "status",
    mapping: {
      "complete": link_path() + "esqlate_complete_result",
      "error": link_path() + "esqlate_error_result",
    }
  }
};

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate result",
  descrition: "esqlate is a restful SQL service with a nice UI",

  definitions: {

    esqlate_complete_result_row: {
      type: "array",
      items: {
        anyOf: [
          { type: "number" },
          { type: "string" },
          { type: "integer" },
          { type: "boolean" },
        ]
      }
    },

    esqlate_field_definition: {
      type: "object",
      additionalProperties: false,
      required: [ "name", "type" ],
      properties: {
        "name": { "type": "string" },
        "type": { "type": "string" }
      }
    },

    esqlate_complete_result: complete_result,
    esqlate_error_result: error_result,
    esqlate_result: result,

  },

} + result
