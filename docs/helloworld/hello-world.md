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
# Get the API key value 
aws apigateway get-api-key --api-key $API_KEY --include-value
```
