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
curl -X POST $API_URL/helloworld \
     -H "Content-Type: application/json" \
     -d '{"name":"Mario"}'

{"message":"Hello Mario and world!"}
```
