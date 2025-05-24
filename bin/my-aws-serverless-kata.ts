#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MyAwsServerlessKataStack } from "../lib/my-aws-serverless-kata-stack";
import { getEnvironmentConfig } from "../lib/config/environment-config";
import { getStage, Stage } from "../lib/config/types";

const stage = getStage(process.env.STAGE as Stage) as Stage;
const appConfig = getEnvironmentConfig(stage);

const app = new cdk.App();

new MyAwsServerlessKataStack(
  app,
  'MyAwsKataStatefulStack',
  {
    "env": appConfig.env,
    "appConfig": appConfig,
    "description": `My AWS Serverless Kata Stack for stage ${stage}`,
  }
);
