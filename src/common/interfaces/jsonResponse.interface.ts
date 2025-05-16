export interface JsonResponse<T> {
  data: T | null;
  errors: string[] | null;
  ok: boolean;
  statusCode: number;
}
