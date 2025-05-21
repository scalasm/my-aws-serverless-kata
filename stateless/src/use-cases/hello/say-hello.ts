import { HelloDto, HelloResponseDto } from "@dto/hello";

export async function sayHelloUseCase(
  hello: HelloDto
): Promise<HelloResponseDto> {
  return {
    message: "Hello, " + hello.who,
  } as HelloResponseDto;
};
