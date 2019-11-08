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

local success_result = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["preview", "complete"] },
    fields: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_field_definition" }
    },
    rows: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_success_result_row" }
    },
    full_data_set: {
      type: "boolean",
      description: "When true the results herein are only partial"
    },
    full_format_urls: {
      type: "array",
      description: "Locations of the results in other formats",
      items: { "$ref": link_path() + "esqlate_complete_result_other_format" }
    }
  },
  required: ["status", "fields", "rows"],
  additionalProperties: false
};

local result = {
  oneOf: [
    { "$ref": link_path() + "esqlate_success_result" },
    { "$ref": link_path() + "esqlate_error_result" }
  ],
  discriminator: {
    propertyName: "status",
    mapping: {
      "preview": link_path() + "esqlate_success_result",
      "complete": link_path() + "esqlate_success_result",
      "error": link_path() + "esqlate_error_result",
    }
  }
};

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate result",
  descrition: "esqlate is a restful SQL service with a nice UI",

  definitions: {

    esqlate_success_result_row: {
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

    esqlate_other_format_url: {
      type: "object",
      additionalProperties: false,
      required: [ "mime_type", "url" ],
      properties: {
        "mime_type": { "type": "string" },
        "url": { "type": "string" }
      }
    },

    esqlate_complete_result_other_format: {
      type: "object",
      additionalProperties: false,
      required: [ "url", "type" ],
      properties: {
        "location": { "type": "string" },
        "type": { "type": "string" }
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

    esqlate_success_result: success_result,
    esqlate_error_result: error_result,
    esqlate_result: result,

  },

} + result
