# Welcome to My AWS Serverless Kata project.

This is a project for learning and experimenting about serverless application patterns and best practices applied to the AWS world.

I use [AWS CDK](https://aws.amazon.com/cdk/) as my infrastructure as code tool.

Everything, from the CDK App to Lambda functions, is done in Typescript for convenience - my focus is on architecture patterns, not really the language features. 

# Suggested toolbox

- Use Visual Studio Code plus AWS and Typescript extensions.
- NodeJS 18.x or newer
- ESLint for Typescript installed

# Useful reference

- [Foobar Serverless](https://www.youtube.com/@foobar_codes) has great getting started tutorials for AWS serverless architectures
- [The Serverless Advocate](https://blog.serverlessadvocate.com/) is an awesome source for information and code with AWS Serverless architectures.
- REST API with AWS CDK by Coner Murphy
  - [How to Build a REST API With the AWS CDK Using API Gateway, Lambda, and Dynamodb With API Key Authentication](https://conermurphy.com/blog/build-rest-api-aws-cdk-api-gateway-lambda-dynamodb-api-key-authentication)
  - [Automatically Create an AWS API Gateway REST API and Related TypeScript Types via an OpenAPI Specification and AWS CDK](https://conermurphy.com/blog/create-aws-api-gateway-rest-api-typescript-types-via-openapi-aws-cdk)
- [CDK Patterns](https://cdkpatterns.com/) is a great public catalog of reusable CDK patterns for your designing your applications.
- [The CDK Book](https://www.thecdkbook.com/) is a mine of information.

## How to run

```bash
# Set you AWS_PROFILE, if needed
export AWS_PROFILE="your AWS profile"

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
