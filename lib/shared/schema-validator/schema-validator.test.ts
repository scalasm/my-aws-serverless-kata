import { schemaValidator } from './schema-validator';

let body = {
  who: 'John',
  age: 25
};

let schema = {
  type: 'object',
  required: ['who', 'age'],
  maxProperties: 2,
  minProperties: 2,
  properties: {
    who: {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    },
    age: {
      type: 'integer'
    },
  },
};

describe('schema-validator', () => {
  it('should validate a schema correctly', () => {
    expect(() => schemaValidator(schema, body)).not.toThrow();
  });

  it('should throw an error if the schema is invalid', () => {
    const badBody = {
      ...body,
      who: null // Invalid target name, should be a non empfty string string
    };
    expect(() =>
      schemaValidator(schema, badBody)
    ).toThrowErrorMatchingInlineSnapshot(
      `"[{\\"instancePath\\":\\"/who\\",\\"schemaPath\\":\\"#/properties/firstName/type\\",\\"keyword\\":\\"type\\",\\"params\\":{\\"type\\":\\"string\\"},\\"message\\":\\"must be string\\"}]"`
    );
  });

  it('should throw an error if the schema is invalid', () => {
    const badBody = {
      ...body,
      age: 2.5 // Invalid age, should be an integer
    };
    expect(() =>
      schemaValidator(schema, badBody)
    ).toThrowErrorMatchingInlineSnapshot(
      `"[{\\"instancePath\\":\\"/firstName\\",\\"schemaPath\\":\\"#/properties/firstName/type\\",\\"keyword\\":\\"type\\",\\"params\\":{\\"type\\":\\"string\\"},\\"message\\":\\"must be string\\"}]"`
    );
  });
});
