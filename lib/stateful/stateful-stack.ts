// Copyright Mario Scalas 2022. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";

import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as logs from 'aws-cdk-lib/aws-logs';

import { EnvironmentConfig } from "@config/environment-config";
import { IObservabilityContributor, ObservabilityHelper } from "../shared/observability";


/**
 * Configuration properties for this stack.
 */
export interface StatefulStackProps extends cdk.NestedStackProps {
  readonly appConfig: EnvironmentConfig;
}

/**
 * Stateful resources for this microservice stack: databasers, queues, event buses
 */
export class StatefulStack extends cdk.NestedStack implements IObservabilityContributor {

  public readonly ordersTable: dynamodb.Table;
  public readonly appEventBus: events.EventBus;

  constructor(scope: constructs.Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'Orders',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      contributorInsightsEnabled: true,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
    });

    this.appEventBus = new events.EventBus(
      this,
      'MyAwsServerlessKataEventBus',
      {
        eventBusName: `my-aws-serverless-kata-event-bus-${props.appConfig.shared.stage}`,	
      }
    );
    this.appEventBus.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // write all of the events to logs so we can track as a catch all
    const eventLogs: logs.LogGroup = new logs.LogGroup(
      this,
      'my-aws-serverless-kata-event-logs',
      {
        logGroupName: 'my-aws-serverless-kata-event-logs',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    new events.Rule(this, 'LogAllEventsToCloudwatch', {
      eventBus: this.appEventBus,
      ruleName: 'LogAllEventsToCloudwatch',
      description: 'log all orders events',
      eventPattern: {
        source: [{ prefix: '' }] as any[], // match all events
      },
      targets: [new targets.CloudWatchLogGroup(eventLogs)],
    });
  }

  contributeWidgets(dashboard: cloudwatch.Dashboard): void {
    const observabilityHelper = new ObservabilityHelper(dashboard);

    observabilityHelper.createDynamoDBTableSection({
      table: this.ordersTable,
      descriptiveName: "Orders table",
    });

    observabilityHelper.createEventBusSection({
      eventBus: this.appEventBus,
      descriptiveName: "Application Event Bus",
    });
  }
}
