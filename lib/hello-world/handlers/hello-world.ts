import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface HelloWorldRequest {
  readonly name: string;
}

export async function main(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("event 👉", event);

  const request = JSON.parse(event.body!);

  return {
    body: JSON.stringify({ message: `Hello ${request.name} and world!` }),
    statusCode: 200,
  };
}
