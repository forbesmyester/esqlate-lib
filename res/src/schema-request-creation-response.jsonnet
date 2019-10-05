local request_creation_response = {
  type: "object",
  properties: {
    location: { type: "string" },
  },
  required: ["location"],
  additionalProperties: false
};

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  title: "esqlate request creation response",
  descrition: "esqlate is a restful SQL service with a nice UI",
  definitions: {
    esqlate_request_creation_response: request_creation_response
 },
} + request_creation_response
