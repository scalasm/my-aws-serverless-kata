# Welcome to My AWS Serverless Kata project.

This is a project for learning and experimenting about serverless application patterns and best practices applied to the AWS world.

I use [AWS CDK](https://aws.amazon.com/cdk/) as my infrastructure as code tool.

Everything, from the CDK App to Lambda functions, is done in Typescript for convenience - my focus is on architecture patterns, not really the language features. 

The `cdk.json` file tells the CDK Toolkit how to execute your app.

# Suggested toolbox

- Use Visual Studio Code plus AWS and Typescript extensions.
- NodeJS 18.x or newer
- ESLint for Typescript installed

# Useful reference

- [The CDK Book](https://www.thecdkbook.com/) is a mine of information.
- [CDK Patterns](https://cdkpatterns.com/) is a great public catalog of reusable CDK patterns for your designing your applications.
`
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
