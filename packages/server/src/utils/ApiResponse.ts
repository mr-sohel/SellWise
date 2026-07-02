import { ApiResponse as IApiResponse } from '@sellwise/shared';

export class ApiResponse {
  static success<T>(data: T, meta?: IApiResponse<T>['meta']): IApiResponse<T> {
    return {
      success: true,
      data,
      error: null,
      ...(meta !== undefined ? { meta } : {})
    };
  }

  static error(code: string, message: string, details?: unknown): IApiResponse<null> {
    return {
      success: false,
      data: null,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {})
      }
    };
  }
}