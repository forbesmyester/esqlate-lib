local link_path() = ( if std.extVar('for-openapi') == "1" then "#/components/schemas/" else "#/definitions/" );

local esqlate_definition = {
  type: "object",
  properties: {
    "name": {
      type: "string",
      description: "unique id",
      pattern: "^_?[a-z][a-z0-9_]{0,99}$"
    },
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
    },
    links: {
      type: "array",
      items: {
        "$ref": link_path() + "esqlate_link"
      }
    },
    row_links: {
      type: "array",
      items: {
        "$ref": link_path() + "esqlate_link"
      }
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
      name: {
        type: "string",
        pattern: "^[a-z][a-z0-9_]{0,99}$"
      },
      type: { type: "string", enum: [parameter_type] },
      highlight_field: { type: "string" },
    },
    local esqlate_parameter_base_required() = ["name", "type"],

    esqlate_parameter_base:: {
      type: "object",
      additionalProperties: false,
      required: ["type", "name"]
    },

    esqlate_link: {
      type: "object",
      description: "Will show a link in the result set allowing navigation to different URL (internal and external)",
      properties: {
        class: { type: "string" },
        text: {
          description: "Application follows interpolonation rules where ${your_field} will be replaced by the your_field from the result set",
          type: "string"
        },
        href: {
          description: "Application follows interpolonation rules where ${your_field} will be replaced by the your_field from the result set",
          type: "string"
        }
      },
      additionalProperties: false,
      required: ["href"]
    },

    esqlate_parameter_server: self.esqlate_parameter_base + {
      properties: esqlate_parameter_base_properties("server")
    },

    esqlate_parameter_date: {
      properties: esqlate_parameter_base_properties("date"),
      additionalProperties: false,
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_datetime: {
      properties: esqlate_parameter_base_properties("datetime"),
      additionalProperties: false,
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_decimal: {
      properties: esqlate_parameter_base_properties("decimal") + {
        decimal_places: {
          type: "number",
          description: "How many decimal places should be allowed"
        }
      },
      additionalProperties: false,
      required: esqlate_parameter_base_required() + ["decimal_places"]
    },

    esqlate_parameter_integer: {
      properties: esqlate_parameter_base_properties("integer"),
      additionalProperties: false,
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_static: {
      properties: esqlate_parameter_base_properties("static"),
      additionalProperties: false,
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_string: {
      properties: esqlate_parameter_base_properties("string"),
      additionalProperties: false,
      required: esqlate_parameter_base_required()
    },

    esqlate_parameter_select: {
      properties: esqlate_parameter_base_properties("select") + {
        definition: { description: "The name of a definition to run", type: "string" },
        display_field: { type: "string" },
        value_field: { type: "string" },
      },
      additionalProperties: false,
      required: esqlate_parameter_base_required() + ["value_field", "definition", "display_field"]
    },

    esqlate_parameter_popup: {
      properties: esqlate_parameter_base_properties("popup") + {
        definition: { type: "string" },
        value_field: { type: "string" },
        display_field: { type: "string" },
      },
      additionalProperties: false,
      required: esqlate_parameter_base_required() + ["definition", "value_field", "display_field"],
    },

    esqlate_parameter: {
      oneOf: [
        { "$ref": link_path() + "esqlate_parameter_select" },
        { "$ref": link_path() + "esqlate_parameter_datetime" },
        { "$ref": link_path() + "esqlate_parameter_date" },
        { "$ref": link_path() + "esqlate_parameter_integer" },
        { "$ref": link_path() + "esqlate_parameter_decimal" },
        { "$ref": link_path() + "esqlate_parameter_static" },
        { "$ref": link_path() + "esqlate_parameter_string" },
        { "$ref": link_path() + "esqlate_parameter_popup" },
        { "$ref": link_path() + "esqlate_parameter_server" },
      ],
      discriminator: {
        propertyName: "type",
        mapping: {
          string: link_path() + "esqlate_parameter_string",
          datetime: link_path() + "esqlate_parameter_datetime",
          date: link_path() + "esqlate_parameter_date",
          integer: link_path() + "esqlate_parameter_integer",
          decimal: link_path() + "esqlate_parameter_decimal",
          static: link_path() + "esqlate_parameter_static",
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
