import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';

import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';

import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';

import { ValidationError } from '@shared/errors/validation-error';
import { errorHandler as handleError } from '@shared/apigw-error-handler';
import { schemaValidator } from '@shared/schema-validator';

import { HelloRequeestDto as HelloRequestDto, HelloResponseDto } from '@hello-world/dto';
import { sayHelloUseCase } from '@hello-world/use-cases';
import { schema } from '@hello-world/adapters/primary/say-hello-world.schema';

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
    // if (!pathParameters || !pathParameters?.name)
    //   throw new ValidationError(
    //     'no Name in the path parameters of the event'
    //   );
    // const { name } = pathParameters;

    const helloRequest: HelloRequestDto = JSON.parse(body);
//    schemaValidator(schema, helloRequest);

    logger.info(`Preparing to salute: ${helloRequest.who}!`);
    
    const helloResponse: HelloResponseDto = await sayHelloUseCase(helloRequest);

    logger.info(
      `Saluting ${helloRequest.who} with salute "${helloResponse.message}"`
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