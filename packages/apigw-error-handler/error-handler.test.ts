import { ValidationError } from '@errors/validation-error';
import { errorHandler } from './error-handler';
import { Logger } from '@aws-lambda-powertools/logger';

describe('error-handler', () => {
  const mockLogger = {
    error: jest.fn()
  } as unknown as Logger;

  it('should default the error and status code on unknown instance type', () => {
    // arrange
    const error = null;

    // act / assert
    expect(errorHandler(mockLogger, error)).toMatchInlineSnapshot(`
Object {
  "body": "\\"An error has occurred\\"",
  "statusCode": 500,
}
`);
  });

  it('should default the error and status code on unknown error', () => {
    // arrange
    const error = new Error('unknown error');

    // act / assert
    expect(errorHandler(mockLogger, error)).toMatchInlineSnapshot(`
Object {
  "body": "\\"An error has occurred\\"",
  "statusCode": 500,
}
`);
  });

  it('should return the correct response on ValidationError', () => {
    // arrange
    const error = new ValidationError('this is a validation error');

    // act / assert
    expect(errorHandler(mockLogger, error)).toMatchInlineSnapshot(`
Object {
  "body": "\\"this is a validation error\\"",
  "statusCode": 400,
}
`);
  });
});
