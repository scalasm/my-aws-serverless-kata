import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

export interface MyAwsKataStatelessStackProps extends cdk.StackProps {
  accountsTable: dynamodb.Table;
  accountsEventBus: events.EventBus;
}

export class MyAwsKataStatelessStack extends cdk.Stack {
 constructor(scope: Construct, id: string, props: MyAwsKataStatelessStackProps) {
    super(scope, id, props);
 
    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'HelloService',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'MyAWSKata',
    };

    const retrieveAccountLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'RetrieveAccountLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/say-hello/say-hello.adapter.ts'
        ),
        memorySize: 256,
        tracing: Tracing.ACTIVE,
        handler: 'handler',
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        environment: {
          ...lambdaPowerToolsConfig,
        },
      });
    }
}
