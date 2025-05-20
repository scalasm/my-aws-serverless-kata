import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Logger parameters fetched from the environment variables:
const logger = new Logger();
import { ValidationError } from '@errors/validation-error';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

// (primary adapter) --> use case --> secondary adapter(s)
export const addSongToPlaylistAdapter = async ({
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

    // const newCustomerPlaylistSong: NewCustomerPlaylistSongDto =
    //   JSON.parse(body);

    // schemaValidator(schema, newCustomerPlaylistSong);

    // const updatedPlaylist: CustomerPlaylistDto = await addSongToPlaylistUseCase(
    //   id,
    //   playlistId,
    //   newCustomerPlaylistSong
    // );

    logger.info(
      `song ${newCustomerPlaylistSong.songId} added to playlist ${playlistId} for account ${id}`
    );

    metrics.addMetric('SuccessfulAddSongToPlaylist', MetricUnits.Count, 1);

    return {
      statusCode: 201,
      body: JSON.stringify(updatedPlaylist),
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const handler = middy(addSongToPlaylistAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));