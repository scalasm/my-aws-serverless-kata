// TODO this is a duplicate of the request JSON schema, probably we may want to generate this code from the schema itself.
export const schema = {
  type: 'object',
  required: ['who'],
  maxProperties: 1,
  minProperties: 1,
  properties: {
    who: {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    },
  },
};
