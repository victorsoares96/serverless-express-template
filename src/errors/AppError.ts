export class AppError extends Error {
  public readonly statusCode: number;

  public readonly error: string;

  public readonly message: string;

  public readonly stack?: string | undefined;

  public readonly validation?: unknown;

  constructor(
    message: string,
    error = 'Bad Request',
    stack?: string | undefined,
    validation?: unknown,
    statusCode = 400,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    this.stack = stack;
    this.validation = validation;
  }
}
