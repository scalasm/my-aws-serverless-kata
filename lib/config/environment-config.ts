import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Region, Stage } from "@config/types";

export interface EnvironmentConfig {
  shared: {
    stage: Stage;
    serviceName: string;
    metricNamespace: string;
    logging: {
      logLevel: 'DEBUG' | 'INFO' | 'ERROR';
      logEvent: 'true' | 'false';
    };
  };
  env: {
    account: string;
    region: string;
  };
  stateless: {
    runtimes: lambda.Runtime;
  };
  stateful: {
    tableName: string;
  };
}

export const getEnvironmentConfig = (stage: Stage): EnvironmentConfig => {
  switch (stage) {
    case Stage.develop:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `my-aws-kata-${Stage.develop}`,
          metricNamespace: `my-aws-kata-${Stage.develop}`,
          stage: Stage.develop,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_20_X,
        },
        env: {
          account: '959713430052',
          region: Region.dublin,
        },
        stateful: {
          tableName: `orders-table-${Stage.develop}`,
        },
      };
    case Stage.prod:
      return {
        shared: {
          logging: {
            logLevel: 'INFO',
            logEvent: 'true',
          },
          serviceName: `my-aws-kata-${Stage.prod}`,
          metricNamespace: `my-aws-kata-${Stage.prod}`,
          stage: Stage.prod,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_20_X,
        },
        env: {
          account: '321723152483',
          region: Region.dublin,
        },
        stateful: {
          tableName: `orders-table-${Stage.prod}`,
        },
      };
      default:
        return {
          shared: {
            logging: {
              logLevel: 'DEBUG',
              logEvent: 'true',
            },
            serviceName: `my-aws-kata-${stage}`,
            metricNamespace: `my-aws-kata-${stage}`,
            stage: stage,
          },
          stateless: {
            runtimes: lambda.Runtime.NODEJS_20_X,
          },
          env: {
            account: '959713430052',
            region: Region.dublin,
          },
          stateful: {
            tableName: `orders-table-${stage}`,
          },
        };
    };
};  