import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';

import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';

import middy from '@middy/core';

import { ValidationError } from '@errors/validation-error';
import { HelloDto, HelloResponseDto } from '@dto/hello';
import { sayHelloUseCase } from '@use-cases/hello/say-hello';
import { errorHandler as handleError } from '@packages/apigw-error-handler';

// Logger parameters fetched from the environment variables:
const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

// (primary adapter) --> use case --> secondary adapter(s)
export const sayHelloAdapter = async ({
  body,
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no Salute body');
    if (!pathParameters || !pathParameters?.name)
      throw new ValidationError(
        'no Name in the path parameters of the event'
      );

    const { name } = pathParameters;

    logger.info(`Preparing to salute: ${name}!`);

    const hello: HelloDto = JSON.parse(body);

    // schemaValidator(schema, newCustomerPlaylistSong);

    const helloResponse: HelloResponseDto = await sayHelloUseCase( hello );

    logger.info(
      `Saluting ${hello.who} with salute "${helloResponse.message}"`
    );

    metrics.addMetric('Salutes', MetricUnit.Count, 1);

    return {
      statusCode: 209,
      body: JSON.stringify(helloResponse),
    };
  } catch (error) {
    return handleError(logger, error);
  }
};

export const handler = middy(sayHelloAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));