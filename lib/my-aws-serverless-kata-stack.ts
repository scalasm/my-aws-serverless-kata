// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { NetworkStack } from "./network-stack";
import { ObservabilityStack } from "./observability-stack";
import { HelloWorldMicroserviceStack } from "./hello-world/microservice-stack";
import { EnvironmentConfig } from "@config/environment-config";

/**
 * Configuration properties.
 */
export interface MyAwsServerlessKataStackProps extends cdk.StackProps {
  /**
   * Stage name for the stack (e.g., "dev", "prod", ...)
   */
  readonly appConfig: EnvironmentConfig;
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

    // The code that defines your stack goes here

    const observableStacks = [
      new HelloWorldMicroserviceStack(this, "helloworld-microservice", {
        vpc: networkStack.vpc,
        authorizer: undefined,
      }),
    ];

    // const observabilityStack = new ObservabilityStack(this, "observability", {
    //   dashboardName: `My AWS Kata (${props?.appConfig.shared.stage})`,
    // });
//    observabilityStack.hookDashboardContributions(observableStacks);
  }
}
