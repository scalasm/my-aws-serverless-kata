// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { NetworkStack } from "./network-stack";
import { ObservabilityStack } from "./observability-stack";
import { StatelessStack } from "./stateless/stateless-stack";
import { EnvironmentConfig } from "./config/environment-config";
import { StatefulStack } from "./stateful/stateful-stack";

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
    props: MyAwsServerlessKataStackProps
  ) {
    super(scope, id, props);

    const networkStack = new NetworkStack(this, "network");

    const statefulStack = new StatefulStack(this, "stateful", {
        appConfig: props.appConfig
    });

    const statelessStack =new StatelessStack(this, "stateless", {
      vpc: networkStack.vpc,
      authorizer: undefined,
      ordersTable: statefulStack.ordersTable,
      appEventBus: statefulStack.appEventBus,
    });

    new ObservabilityStack(this, "observability", {
      dashboardName: `My AWS Kata (${props?.appConfig.shared.stage})`,
      contributors: [
        statelessStack,
        statefulStack,
      ],
    });
  }
}
  