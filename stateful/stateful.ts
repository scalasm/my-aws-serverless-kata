import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export class MyAwsKataStatefulStack extends cdk.Stack {
  public readonly helloTable: dynamodb.Table;
  public readonly helloEventBus: events.EventBus;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // write all of the events to logs so we can track as a catch all
    const applicationLogs: logs.LogGroup = new logs.LogGroup(
      this,
      'my-aws-kata-event-logs',
      {
        logGroupName: 'my-aws-kata-event-logs',
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // create the dynamodb table for storing our orders
    this.helloTable = new dynamodb.Table(this, 'EntitlementsTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
      contributorInsightsEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    this.helloEventBus = new events.EventBus(
      this,
      'MyAwsKataEventBus',
      {
        eventBusName: 'my-aws-kata-event-bus',
      }
    );
    this.helloEventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    new events.Rule(this, 'LogAllEventsToCloudwatch', {
      eventBus: this.helloEventBus,
      ruleName: 'LogAllEventsToCloudwatch',
      description: 'log all events for the event bus to cloudwatch',
      eventPattern: {
        source: [{ prefix: '' }] as any[], // match all events
      },
      targets: [new targets.CloudWatchLogGroup(applicationLogs)],
    });
  }
}