# Orders API

## How to call the API
Once you have deployed the stack, an URL will be shown that you can use to invoke the REST API hello world endpoint:

```bash
...
...
Outputs:
...
MyAwsServerlessKataStack.apiUrl = https://yyy1mlgwxxx.execute-api.eu-west-1.amazonaws.com/dev/
Stack ARN:
...
```

```bash
export API_URL="https://yyy1mlgwxxx.execute-api.eu-west-1.amazonaws.com/dev/"
curl -X POST $API_URL/orders \
     -H "Content-Type: application/json" \
     -H "X-Api-Key: <api key from your AWS console>" \
     -d '{"orderId":"123", "customerId": "123a-a5c2-44be-4441", "lineItems": [{"productId":"100", "quantity":10}]}'
```
