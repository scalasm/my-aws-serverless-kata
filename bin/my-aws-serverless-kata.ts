#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MyAwsServerlessKataStack } from "../lib/my-aws-serverless-kata-stack";

import { MyAwsKataStatefulStack } from '../stateful/stateful';
import { MyAwsKataStatelessStack } from '../stateless/stateless';

const app = new cdk.App();

const statefulStack = new MyAwsKataStatefulStack(
  app,
  'MyAwsKataStatefulStack',
  {}
);

new MyAwsKataStatelessStack(app, 'MyAwsKataStatefulStackStatelessStack', {
  accountsTable: statefulStack.helloTable,
  accountsEventBus: statefulStack.helloEventBus,
});
