// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as fs from "fs";
import * as path from 'path';

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from 'aws-cdk-lib/aws-events';

import { IObservabilityContributor, ObservabilityHelper } from "../shared/observability";

/**
 * Configuration properties for the the this Microservice.
 */
export interface StatelessStackProps extends cdk.NestedStackProps {
  /**
   * Target VPC where lambda functions and other resources will be created.
   */
  readonly vpc: ec2.IVpc;

  /**
   * Authorizer for API calls - if endpoints are to be protected, this is the authorizer to use.
   */
  readonly authorizer?: apigateway.Authorizer;

  readonly ordersTable: dynamodb.Table;
  readonly appEventBus: events.EventBus;
}

/**
 * A simple way for grouping the different response models used within this microservice stack.
 */
interface ResponseModels {
  readonly http404NotFoundResponseModel: apigateway.Model;
}

/**
 * Simple HelloWorld Microservice stack that expose a simple function in the most complicated way XD.
 */
export class StatelessStack extends cdk.NestedStack implements IObservabilityContributor {
  private readonly helloWorldResource: apigateway.Resource;

  private readonly defaultFunctionSettings: any;

  private readonly helloWorldFunction: lambda.IFunction;

  private readonly restApi: apigateway.RestApi

  private readonly responseModels: ResponseModels;

  constructor(scope: constructs.Construct, id: string, props: StatelessStackProps) {
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

    // All lambda functions are Python 3.9-based and will be hosted in in private subnets inside target VPC.
    this.defaultFunctionSettings = {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      // Functions are pretty quick, so this is quite conservative
      timeout: cdk.Duration.seconds(5),
      tracing: lambda.Tracing.ACTIVE,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        ...lambdaPowerToolsConfig
      }
    };

    this.restApi = this.buildRestApi(props);
    this.responseModels = this.initializeSharedResponseModels(props);

    this.helloWorldResource = this.restApi.root.addResource("helloworld");
    this.helloWorldFunction = this.bindHelloWorldFunction(props);
  }

  private buildRestApi(props: StatelessStackProps): apigateway.RestApi {
    const api = new apigateway.RestApi(this, "api", {
      restApiName: "Hellow World - REST API",
      description: "Hellow World - REST API",
      deployOptions: {
        stageName: "dev",
      },
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowCredentials: true,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    const apiKey = new apigateway.ApiKey(this, "ApiKey");

    const usagePlan = new apigateway.UsagePlan(this, "UsagePlan", {
      name: "My Serverless Kata - Usage Plan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);

    // 👇 create an Output for the API URL
    new cdk.CfnOutput(this, "apiUrl", {
      value: api.url,
    });

    new cdk.CfnOutput(this, "apiKey", {
      value: apiKey.keyArn,
    });

    return api;
  }

  public contributeWidgets(dashboard: cloudwatch.Dashboard): void {
    const observabilityHelper = new ObservabilityHelper(dashboard);

    observabilityHelper.createLambdaFunctionSection({
      function: this.helloWorldFunction,
      descriptiveName: "Say Hello to the World!",
    });
  }

  private initializeSharedResponseModels(props: StatelessStackProps): ResponseModels {
    const http404NotFoundResponseModel = this.createModelFromJsonSchemaFile(
      "./adapters/primary/resource-not-found.response.schema.json", "Http404Response");

    return {
      http404NotFoundResponseModel,
    };
  }

  private bindHelloWorldFunction(props: StatelessStackProps): lambda.Function {
    const helloWorldFunction = new lambda_nodejs.NodejsFunction(this, 'hello-world-function', {
      ...this.defaultFunctionSettings,
      POWERTOOLS_SERVICE_NAME: 'SayHelloWorldLambda',
      handler: 'handler',
      entry: path.join(__dirname, `./adapters/primary/say-hello-world.adapter.ts`),
    });

    props.ordersTable.grantReadWriteData(helloWorldFunction);
    props.appEventBus.grantPutEventsTo(helloWorldFunction);

    this.setUpRequestResponseModels(
      this.helloWorldResource, // target REST API resource
      "SayHelloWorld", // operation name
      "POST", // HTTP method
      "./adapters/primary/say-hello-world.request.schema.json", // request schema
      "./adapters/primary/say-hello-world.response.schema.json", // response schema
      new apigateway.LambdaIntegration(helloWorldFunction, { proxy: true }), // integration
      {
        authorizationType: apigateway.AuthorizationType.NONE,
        authorizer: props.authorizer,
      } // method options
    );

    return helloWorldFunction;
  }

  private setUpRequestResponseModels(targetResource: apigateway.Resource, 
    operationName: string, httpVerb: string, requestJsonSchemaPath: string, responseJsonSchemaPath: string,
    integration: apigateway.Integration, methodOptions: apigateway.MethodOptions): any {
    
    const requestModel = this.createModelFromJsonSchemaFile(requestJsonSchemaPath, `${operationName}Request`);
    const responseModel = this.createModelFromJsonSchemaFile(responseJsonSchemaPath, `${operationName}Response`);

    const requestValidator = new apigateway.RequestValidator(this, `${operationName}RequestValidator`, {
      restApi: this.restApi,
      requestValidatorName: `Validate Payload and parameters for ${operationName}`,
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    targetResource.addMethod(httpVerb, integration, {
      ...methodOptions,

      requestModels: {
        "application/json": requestModel,
      },
      requestValidator: requestValidator,
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": responseModel,
          },
        },
      ],
    });
  }

  private createModelFromJsonSchemaFile(responseJsonSchemaPath: string, modelName: string) {
    const responseSchema = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, responseJsonSchemaPath),
        "utf8"
      )
    );
    const responseModel = this.restApi.addModel(
      `${modelName}Model`, {
      modelName: `${modelName}Model`,
      contentType: "application/json",
      schema: responseSchema,
    }
    );
    return responseModel;
  }
}
