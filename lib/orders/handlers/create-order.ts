import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface OrderLineItem {
  readonly productId: string;
  readonly quantity: number;
}

interface CreateOrderRequest {
  readonly orderId: string;
  readonly customerId: string;

  readonly lineItems: OrderLineItem[];
}

interface CreateOrderResponse {
  readonly orderId: string;
  readonly message: string;
}

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log("event 👉", event);

  const request: CreateOrderRequest = JSON.parse(event.body!);

  const response = createOrder(request);

  return {
    body: JSON.stringify(response),
    statusCode: 200,
  };
}

function createOrder(request: CreateOrderRequest): CreateOrderResponse {
  // generate UUID for the order
  const orderId = request.orderId;

  console.log("Order created", request);

  return {
    orderId,
    message: "Order created",
  };
}
