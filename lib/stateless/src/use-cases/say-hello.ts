import { HelloRequeestDto, HelloResponseDto } from "@hello-world/src/dto";

export async function sayHelloUseCase(
  hello: HelloRequeestDto
): Promise<HelloResponseDto> {
  return {
    message: "Hello, " + hello.who,
  } as HelloResponseDto;
};
