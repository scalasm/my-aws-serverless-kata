// Copyright Mario Scalas 2024. All Rights Reserved.
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
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { jsonSchema } from "../shared/common-utils";
import { IObservabilityContributor, ObservabilityHelper } from "../shared/common-observability";

/**
 * Configuration properties for the the this Microservice.
 */
export interface OrdersMicroserviceStackProps extends cdk.NestedStackProps {
  /**
   * Target VPC where lambda functions and other resources will be created.
   */
  readonly vpc: ec2.IVpc;

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
  readonly http404NotFoundResponseModel: apigateway.Model;
}

/**
 * Orders Microservice stack.
 */
export class OrdersMicroserviceStack extends cdk.NestedStack implements IObservabilityContributor {
  private readonly ordersResource: apigateway.Resource;

  private readonly defaultFunctionSettings: DefaultLambdaSettings;
  /**
   * Target API Gateway REST API under which the resources will be created.
   */
  readonly restApi: apigateway.RestApi;

  private readonly createOrderFunction: lambda.IFunction;

  private readonly responseModels: ResponseModels;
  private readonly requestValidator: apigateway.RequestValidator;

  private readonly ordersTable: dynamodb.Table;

  constructor(scope: constructs.Construct, id: string, props: OrdersMicroserviceStackProps) {
    super(scope, id, props);

    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'Orders',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // All lambda functions are Nodejs-based and will be hosted in in private subnets inside target VPC.
    this.defaultFunctionSettings = {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      // Functions are pretty quick, so this is quite conservative
      timeout: cdk.Duration.seconds(5),
      environment: {
        ORDERS_TABLE_NAME: this.ordersTable.tableName,
        POWERTOOLS_SERVICE_NAME: "orders",
        POWERTOOLS_LOGGER_LOG_EVENT: "true",
        LOG_LEVEL: "INFO",
      }
    };

    this.restApi = this.buildRestApi();

    this.responseModels = this.initializeSharedResponseModels(props);
    // We validate input parameters and payload
    this.requestValidator = new apigateway.RequestValidator(this, "OrdersRequestValidator", {
      restApi: this.restApi,
      requestValidatorName: "Validate Payload and parameters",
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    this.ordersResource = this.restApi.root.addResource("orders");
    this.createOrderFunction = this.bindCreateOrderFunction(props);
  }

  private buildRestApi(): apigateway.RestApi {
    const api = new apigateway.RestApi(this, "api", {
      restApiName: "Orders - REST API",
      description: "Orders - REST API",
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
      function: this.createOrderFunction,
      descriptiveName: "Orders - Create Order",
    });
  }

  /**
   * Creates some shared response models that can be used by the different resources in this microservice.
   * @param props Properties for the stack
   * @returns the shared response models used within this microservice stack.
   */
  private initializeSharedResponseModels(props: OrdersMicroserviceStackProps): ResponseModels {
    // Only 404 but it is not useful for now
    const http404NotFoundResponseModel = this.restApi.addModel(
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
      http404NotFoundResponseModel,
    };
  }

  private bindCreateOrderFunction(props: OrdersMicroserviceStackProps): lambda.Function {
    const functionName = "CreateOrder";
    const createOrderFunction = new lambda_nodejs.NodejsFunction(this, `${functionName}`, {
      ...this.defaultFunctionSettings,
      handler: 'main',
      entry: path.join(__dirname, `./handlers/create-order.ts`),
    });

    this.ordersTable.grantWriteData(createOrderFunction);

    // This should be replaced by an OpenAPI schema
    const requestModel = this.restApi.addModel(
      `${functionName}RequestModel`,
      jsonSchema({
      modelName: `${functionName}RequestModel`,
      properties: {
        orderId: { type: apigateway.JsonSchemaType.STRING },
        customerId: { type: apigateway.JsonSchemaType.STRING },
        lineItems: {
        type: apigateway.JsonSchemaType.ARRAY,
        items: {
          type: apigateway.JsonSchemaType.OBJECT,
          properties: {
          productId: { type: apigateway.JsonSchemaType.STRING },
          quantity: { type: apigateway.JsonSchemaType.INTEGER },
          },
        },
        },
      },
      requiredProperties: ["orderId", "customerId", "lineItems"],
      })
    );

    const responseModel = this.restApi.addModel(
      `${functionName}ResponseModel`,
      jsonSchema({
      modelName: `${functionName}ResponseModel`,
      properties: {
        orderId: { type: apigateway.JsonSchemaType.STRING },
        message: { type: apigateway.JsonSchemaType.STRING }
      },
      requiredProperties: ["orderId", "message"],
      })
    );

    this.ordersResource.addMethod("POST", new apigateway.LambdaIntegration(createOrderFunction, { 
      proxy: true 
    }), {
      authorizationType: apigateway.AuthorizationType.NONE,
      apiKeyRequired: true,
//      authorizer: props.authorizer,

      requestModels: {
        "application/json": requestModel,
      },
      requestValidator: this.requestValidator,
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": responseModel,
          },
        },
        {
          statusCode: "404",
          responseModels: {
            "application/json": this.responseModels.http404NotFoundResponseModel,
          },
        },
      ],
    });

    return createOrderFunction;
  }
}
