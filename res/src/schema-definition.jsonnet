local link_path() = ( if std.extVar('for-openapi') == "1" then "#/components/schemas/" else "#/definitions/" );

local esqlate_definition = {
  type: "object",
  properties: {
    "name": { type: "string", description: "unique id" },
    title: { description: "The title for the Definition", type: "string" },
    description: { description: "An opportunity to explain more...", type: "string" },
    statement: {
      "$ref": link_path() + "esqlate_statement"
    },
    parameters: {
      type: "array",
      items: {
        "$ref": link_path() + "esqlate_parameter",
      },
    }
  },
  required: ["name", "title", "statement", "parameters"],
  additionalProperties: false,
};

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate definition",
  description: "esqlate is a restful SQL service with a nice UI",
  definitions: {

    local parent = self,
    local esqlate_parameter_base_properties(parameter_type) = {
      name: { type: "string" },
      allow_null: { type: "boolean" },
      type: { type: "string", enum: [parameter_type] },
    },
    local esqlate_parameter_base_required() = ["name", "type"],

    esqlate_parameter_base:: {
      type: "object",
      additionalProperties: false,
      required: ["type", "name"]
    },

    esqlate_parameter_server: self.esqlate_parameter_base + {
      properties: esqlate_parameter_base_properties("server")
    },

    esqlate_parameter_integer: {
      properties: esqlate_parameter_base_properties("integer") + {
        default_value: { "type": "integer", "multipleOf": 1 }
      },
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_string: {
      properties: esqlate_parameter_base_properties("string") + {
        default_value: { "type": "string" }
      },
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_select: {
      properties: esqlate_parameter_base_properties("select") + {
        definition: { description: "The name of a definition to run", type: "string" },
        display_field: { type: "string" },
        value_field: { type: "string" },
      },
      required: esqlate_parameter_base_required() + ["value_field", "definition", "display_field"]
    },

    esqlate_parameter_popup: {
      properties: esqlate_parameter_base_properties("popup") + {
        name: { type: "string" },
        definition: { type: "string" },
        value_field: { type: "string" },
      },
      required: esqlate_parameter_base_required() + ["statement", "value_field"],
    },

    // esqlate_alias: {
    //   type: "object",
    //   additionalProperties: false,
    //   required: [ "source", "destination" ],
    //   properties: {
    //     "source": {
    //       "type": "string"
    //     },
    //     "destination": {
    //       "type": "string"
    //     },
    //   }
    // },

    esqlate_parameter: {
      oneOf: [
        { "$ref": link_path() + "esqlate_parameter_select" },
        { "$ref": link_path() + "esqlate_parameter_integer" },
        { "$ref": link_path() + "esqlate_parameter_string" },
        { "$ref": link_path() + "esqlate_parameter_popup" },
        { "$ref": link_path() + "esqlate_parameter_server" },
      ],
      discriminator: {
        propertyName: "type",
        mapping: {
          string: link_path() + "esqlate_parameter_string",
          integer: link_path() + "esqlate_parameter_integer",
          select: link_path() + "esqlate_parameter_select",
          popup: link_path() + "esqlate_parameter_popup",
          server: link_path() + "esqlate_parameter_server",
        }
      }
    },

    esqlate_statement_normalized: {
      type: "array",
      items: {
        anyOf: [
          { type: "string" },
          { "$ref": link_path() + "esqlate_parameter" },
        ],
      },
    },

    esqlate_statement: {
      oneOf: [
        { type: "string" },
        { "$ref": link_path() + "esqlate_statement_normalized" },
      ],
    },

    esqlate_definition: esqlate_definition

  },


} + esqlate_definition
