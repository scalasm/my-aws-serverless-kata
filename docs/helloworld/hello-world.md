## How to call the API

Once you have deployed the stack, an URL will be shown that you can use to invoke the REST API hello world endpoint:

```bash
...
...
Outputs:
MyAwsServerlessKataStack.apiEndpoint9349E63C = https://141mlgwiy3.execute-api.eu-west-1.amazonaws.com/dev/
MyAwsServerlessKataStack.apiUrl = https://141mlgwiy3.execute-api.eu-west-1.amazonaws.com/dev/
Stack ARN:
...
```

```bash
export API_URL="https://xxxxxyyyzzz.execute-api.eu-west-1.amazonaws.com/dev/"
export API_KEY ="<api key you get from below>"
curl -X POST $API_URL/helloworld \
     -H "Content-Type: application/json" \
     -H "X-Api-Key: ${API_KEY}" \
     -d '{"who":"Mario"}'

{"message":"Hello, Mario"}
```

Some useful tips:
```bash
# Find the API Key id - we will query its value later on
export API_KEY_ID=$(aws cloudformation list-stack-resources --stack-name <Your stack name> \
  --query "StackResourceSummaries[?ResourceType=='AWS::ApiGateway::ApiKey'].PhysicalResourceId" \
  --output text)

# Get the API key value 
export API_KEY=$(aws apigateway get-api-key --api-key $API_KEY_ID --include-value --query 'value' --output text)
```
