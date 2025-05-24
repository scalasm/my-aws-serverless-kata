# Welcome to My AWS Serverless Kata project.

This is a project for learning and experimenting about serverless application patterns and best practices applied to the AWS serverless world.

I use [AWS CDK](https://aws.amazon.com/cdk/) as my infrastructure as code tool as well as the main way for deploying application code.

Everything, from the CDK App to Lambda functions, is done in Typescript for convenience - my focus is on architecture patterns with AWS, not really the language features. 

# Suggested toolbox

- Use Visual Studio Code plus AWS and Typescript extensions.
  - a DevContainer configuration is provided to automate this and provide you a ready-to-use environment

If you want to run the stack locally, then you will need:
- NodeJS 20.x or newer
- ESLint for Typescript installed
- AWS CDK 2.1016.x or better.

# Useful references

- [Foobar Serverless](https://www.youtube.com/@foobar_codes) has great getting started tutorials for AWS serverless architectures
- [The Serverless Advocate](https://blog.serverlessadvocate.com/) is an awesome source for information and code with AWS Serverless architectures.
  - [Serverless Lightweight Clean Code Approach](https://blog.serverlessadvocate.com/serverless-lightweight-clean-code-approach-84133c90eeeb)
- REST API with AWS CDK by Coner Murphy
  - [How to Build a REST API With the AWS CDK Using API Gateway, Lambda, and Dynamodb With API Key Authentication](https://conermurphy.com/blog/build-rest-api-aws-cdk-api-gateway-lambda-dynamodb-api-key-authentication)
  - [Automatically Create an AWS API Gateway REST API and Related TypeScript Types via an OpenAPI Specification and AWS CDK](https://conermurphy.com/blog/create-aws-api-gateway-rest-api-typescript-types-via-openapi-aws-cdk)
- [CDK Patterns](https://cdkpatterns.com/) is a great public catalog of reusable CDK patterns for your designing your applications.
- [The CDK Book](https://www.thecdkbook.com/) is a mine of information.
- [Powertools for AWS Lambda](https://docs.powertools.aws.dev/)

## How to run

We assume that there are 3 stages:
- `develop` - development environment
- `staging` - integration/QA environment
- `prod` - Production environment

Ideally, those would be separate AWS accounts but this is not a requirement. See the [stack configuration docs](./docs/app-stack-config.md).

Ensure that you are correctly logged in (e.g., you assumed the correct roles) for operating on your target environment. Then you can run something like:

```bash
# Set you AWS_PROFILE, if needed
export AWS_PROFILE="your AWS profile"
# Set your target environment
export STAGE="develop"
# show generated Cloudformation
npm run cdk:synth

# Deploy to the current AWS account you are logged in
# This may take a few minutes
npm run cdk:deploy
```

# Manual testing 
Once deployed, you can play with the API endpoints.
- [Hello World](./docs/helloworld/hello-world.md)
- [Orders](./docs/orders/orders.md)

# TODO 
- Implement automated testing with Jest
- Add a saga orchestration
- Implement CI/CD with GitHub actions
