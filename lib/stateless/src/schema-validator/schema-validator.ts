import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationError } from '@hello-world/src/errors/validation-error';

export function schemaValidator(schema: Record<string, any>, body: any) {
  const ajv = new Ajv({
    allErrors: true,
  });

  addFormats(ajv);
  ajv.addSchema(schema);

  const valid = ajv.validate(schema, body);

  if (!valid) {
    const errorMessage = JSON.stringify(ajv.errors);
    throw new ValidationError(errorMessage);
  }
}
