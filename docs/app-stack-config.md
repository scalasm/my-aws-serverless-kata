# Application configuration

In this application we opted for [strongly-typed configurations](https://blog.serverlessadvocate.com/configuring-aws-cdk-apps-across-multiple-environments-f9e0f1158a70) mixed with
[CDK Context](https://docs.aws.amazon.com/cdk/v2/guide/context.html).

The `cdk.context.json` contains the AWS region and environment you are targeting - they should be matching the values expected in ``config/**` files.

# How to provide your own configuration
Create `~/.cdk.json` file with the following configurations:
```json
{
  "develop": {
    "region": "eu-west-1", 
    "account": "your AWS account number"
  },
  "staging": {
    "region": "eu-west-1", 
    "account": "your AWS account number"
  },
  "prod": {
    "region": "eu-west-1", 
    "account": "your AWS account number"
  }
}
```

(Pick the region you prefer: ensure it has been CDK-bootstrapped!)

Note that I only wanted to avoid specifying AWS accounts on version control, and `~/.cdk.json` sounds like the easiest way.

# Alternatives

Instead of using `~/.cdk.json`, you may want to use the `cdk.context.json` or even specify context variables on the command line:

Run 
```bash
cdk diff -c develop='{"region":"us-east-1", "account": "your AWS account number"}' -c staging='{"region":"eu-west-1", "account": "another AWS account number"}'
```

# Future work

Additional ways to configure your application is to use [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) or [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) to manage sensitive credentials.

In this application stack this is an overkill, and we are happy to not put environments on version config