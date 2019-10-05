local link_path() = ( if std.extVar('for-openapi') == "1" then "#/components/schemas/" else "#/definitions/" );
local schemaRequestCreation = import "./schema-request-creation.jsonnet";
local request = {
  type: "object",
  properties: {
    arguments: { "$ref": link_path() + "esqlate_request_argument_set" },
    status: { type: "string", enum: [ "complete", "pending" ] },
    location: {
      description: "The status of a request",
      type: "string"
    },
  },
  required: ["status", "arguments"],
  additionalProperties: false
};

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate request",
  descrition: "esqlate is a restful SQL service with a nice UI",
  definitions: {
    esqlate_request: request,
    esqlate_request_argument: schemaRequestCreation["definitions"]["esqlate_argument"],
    esqlate_request_argument_set: {
      type: "array",
      items: { "$ref": link_path() + "esqlate_request_argument" }
    },
 },
} + request
