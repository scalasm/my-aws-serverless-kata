// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

import { NetworkStack } from "./network-stack";
import { HelloWorldMicroserviceStack } from "./hello-world/microservice-stack";
import { OrdersMicroserviceStack } from "./orders/microservice-stack";
import { ObservabilityStack } from "./observability-stack";

/**
 * Configuration properties.
 */
export interface MyAwsServerlessKataStackProps extends cdk.StackProps {
  /**
   * Stage name for the stack (e.g., "dev", "prod", ...)
   */
  readonly stage: string;
}

/**
 * Application stack is comprised by shared infrastructure resources, policies, and 
 * Microservices stack.
 */
export class MyAwsServerlessKataStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: MyAwsServerlessKataStackProps
  ) {
    super(scope, id, props);

    const networkStack = new NetworkStack(this, "network");

    const restApi = this.buildRestApi();
    // The code that defines your stack goes here

    const observableStacks = [
      // new HelloWorldMicroserviceStack(this, "helloworld-microservice", {
      //   vpc: networkStack.vpc,
      //   restApi: restApi,
      //   authorizer: undefined,
      // }),
      new OrdersMicroserviceStack(this, "orders-microservice", {
        vpc: networkStack.vpc,
        restApi: restApi,
        authorizer: undefined,
      }),
    ];

    const observabilityStack = new ObservabilityStack(this, "observability", {
      dashboardName: `My AWS Kata (${props?.stage})`,
      restApi: restApi,
    });
    observabilityStack.hookDashboardContributions(observableStacks);
  }

  private buildRestApi(): apigateway.RestApi {
    const api = new apigateway.RestApi(this, "api", {
      restApiName: "My Serverless Kata - REST API",
      description: "REST API that is part of my AWS Serverless Kata.",
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
}
