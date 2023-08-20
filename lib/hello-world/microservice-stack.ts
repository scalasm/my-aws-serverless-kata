// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as path from 'path';

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

import { jsonSchema } from "../shared/common-utils";
import { IObservabilityContributor, ObservabilityHelper } from "../shared/common-observability";

/**
 * Configuration properties for the the this Microservice.
 */
export interface HelloWorldMicroserviceStackProps extends cdk.NestedStackProps {
  /**
   * Target VPC where lambda functions and other resources will be created.
   */
  readonly vpc: ec2.IVpc;
  /**
   * Target API Gateway REST API under which the resources will be created.
   */
  readonly restApi: apigateway.RestApi;

  /**
   * Authorizer for API calls - if endpoints are to be protected, this is the authorizer to use.
   */
  readonly authorizer?: apigateway.Authorizer;
}

/**
 * (internal) Typed interface for the shared settings for the lambda functions we use in this microservice.
 */
interface DefaultLambdaSettings {
  vpc: cdk.aws_ec2.IVpc;
  vpcSubnets: {
    subnetType: cdk.aws_ec2.SubnetType;
  };
  runtime: cdk.aws_lambda.Runtime;
  environment: { [key: string]: string };
  memorySize: number,
  // Functions are pretty quick, so this is quite conservative
  timeout: cdk.Duration;
}

/**
 * A simple way for grouping the different response models used within this microservice stack.
 */
interface ResponseModels {
  readonly helloWorldResponseModel: apigateway.Model;
  readonly http404NotFoundResponseModel: apigateway.Model;
}

/**
 * Simple HelloWorld Microservice stack that expose a simple function in the most complicated way XD.
 */
export class HelloWorldMicroserviceStack extends cdk.NestedStack implements IObservabilityContributor {
  private readonly helloWorldResource: apigateway.Resource;

  private readonly defaultFunctionSettings: DefaultLambdaSettings;

  private readonly helloWorldFunction: lambda.IFunction;

  private readonly responseModels: ResponseModels;

  constructor(scope: constructs.Construct, id: string, props: HelloWorldMicroserviceStackProps) {
    super(scope, id, props);

    // All lambda functions are Python 3.9-based and will be hosted in in private subnets inside target VPC.
    this.defaultFunctionSettings = {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 128,
      // Functions are pretty quick, so this is quite conservative
      timeout: cdk.Duration.seconds(5),
      environment: {
        POWERTOOLS_SERVICE_NAME: "hello-world",
        POWERTOOLS_LOGGER_LOG_EVENT: "true",
        LOG_LEVEL: "INFO",
      }
    };

    this.responseModels = this.initializeSharedResponseModels(props);

    this.helloWorldResource = props.restApi.root.addResource("helloworld");
    this.helloWorldFunction = this.bindHelloWorldFunction(props);
  }

  public contributeWidgets(dashboard: cloudwatch.Dashboard): void {
    const observabilityHelper = new ObservabilityHelper(dashboard);

    observabilityHelper.createLambdaFunctionSection({
      function: this.helloWorldFunction,
      descriptiveName: "Say Hello to the World!",
    });
  }

  private initializeSharedResponseModels(props: HelloWorldMicroserviceStackProps): ResponseModels {
    const helloWorldResponseModel = props.restApi.addModel(
      "HelloWorldResponseModel",
      jsonSchema({
        modelName: "HelloWorldResponseModel",
        properties: {
          message: { type: apigateway.JsonSchemaType.STRING }
        },
        requiredProperties: ["message"],
      })
    );

    const http404NotFoundResponseModel = props.restApi.addModel(
      "Http404ResponseModel",
      jsonSchema({
        modelName: "Http404ResponseModel",
        properties: {
          message: { type: apigateway.JsonSchemaType.STRING },
        },
        requiredProperties: ["message"],
      })
    );

    return {
      helloWorldResponseModel: helloWorldResponseModel,
      http404NotFoundResponseModel,
    };
  }

  private bindHelloWorldFunction(props: HelloWorldMicroserviceStackProps): lambda.Function {
    const helloWorldFunction = new lambda_nodejs.NodejsFunction(this, 'hello-world-function', {
      ...this.defaultFunctionSettings,
      handler: 'main',
      entry: path.join(__dirname, `./handlers/hello-world.ts`),
    });

    // POST /u
    const requestModel = props.restApi.addModel(
      "HelloWorldRequestModel",
      jsonSchema({
        modelName: "HelloWorldRequestModel",
        properties: {
          name: { type: apigateway.JsonSchemaType.STRING },
        },
        requiredProperties: ["name"],
      })
    );

    const requestValidator = new apigateway.RequestValidator(this, "HelloWorldRequestValidator", {
      restApi: props.restApi,
      requestValidatorName: "Validate Payload and parameters",
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    this.helloWorldResource.addMethod("POST", new apigateway.LambdaIntegration(helloWorldFunction, { proxy: true }), {
      authorizationType: apigateway.AuthorizationType.NONE,
//      authorizer: props.authorizer,

      requestModels: {
        "application/json": requestModel,
      },
      requestValidator: requestValidator,
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": this.responseModels.helloWorldResponseModel,
          },
        },
      ],
    });

    return helloWorldFunction;
  }
}
