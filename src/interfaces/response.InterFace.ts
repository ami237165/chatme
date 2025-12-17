export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
}
