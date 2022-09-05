export type Error = {
  statusCode: number;
  error: string;
  message: string;
  stack?: string;
  validation?: unknown;
};
