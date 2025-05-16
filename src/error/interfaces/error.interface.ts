export interface ErrorResponse {
  response: ErrorProperties;
}

export interface ErrorProperties {
  status: number;
  message: string[];
}
