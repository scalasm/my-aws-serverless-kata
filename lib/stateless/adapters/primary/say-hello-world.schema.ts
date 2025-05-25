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
