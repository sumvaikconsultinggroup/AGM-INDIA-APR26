/**
 * Standardized API Response Helper
 * Enterprise-grade response formatting for consistency across all 79+ API routes.
 * 
 * Usage:
 *   return ApiResponse.success(data, 'Fetched successfully');
 *   return ApiResponse.created(newItem, 'Created successfully');
 *   return ApiResponse.error('Not found', 404);
 *   return ApiResponse.paginated(items, { page: 1, limit: 20, total: 100 });
 */

import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  timestamp: string;
}

function getAllowedOriginHeaders(origin?: string | null) {
  const allowedOrigins = [
    'https://www.avdheshanandg.org',
    'https://www.avdheshanandgmission.org',
    'https://avdheshanandgmission.org',
    'https://avdheshanandg.org',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export class ApiResponse {
  static success<T>(data: T, message = 'Success', status = 200, origin?: string | null): NextResponse {
    const body: ApiSuccessResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, {
      status,
      headers: {
        ...getAllowedOriginHeaders(origin),
        'X-Request-Id': crypto.randomUUID(),
      },
    });
  }

  static created<T>(data: T, message = 'Created successfully', origin?: string | null): NextResponse {
    return ApiResponse.success(data, message, 201, origin);
  }

  static paginated<T>(
    data: T[],
    pagination: { page: number; limit: number; total: number },
    message = 'Fetched successfully',
    origin?: string | null
  ): NextResponse {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };

    const body: ApiSuccessResponse<T[]> = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        ...getAllowedOriginHeaders(origin),
        'X-Request-Id': crypto.randomUUID(),
        'X-Total-Count': String(pagination.total),
        'X-Page': String(pagination.page),
        'X-Limit': String(pagination.limit),
      },
    });
  }

  static error(
    message: string,
    status = 500,
    code?: string,
    origin?: string | null
  ): NextResponse {
    const body: ApiErrorResponse = {
      success: false,
      message,
      code: code || getErrorCode(status),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, {
      status,
      headers: {
        ...getAllowedOriginHeaders(origin),
        'X-Request-Id': crypto.randomUUID(),
      },
    });
  }

  static badRequest(message = 'Bad request', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 400, 'BAD_REQUEST', origin);
  }

  static unauthorized(message = 'Authentication required', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 401, 'UNAUTHORIZED', origin);
  }

  static forbidden(message = 'Access denied', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 403, 'FORBIDDEN', origin);
  }

  static notFound(message = 'Resource not found', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 404, 'NOT_FOUND', origin);
  }

  static conflict(message = 'Resource already exists', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 409, 'CONFLICT', origin);
  }

  static tooManyRequests(message = 'Rate limit exceeded. Please try again later.', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 429, 'RATE_LIMITED', origin);
  }

  static serverError(message = 'Internal server error', origin?: string | null): NextResponse {
    return ApiResponse.error(message, 500, 'INTERNAL_ERROR', origin);
  }

  static validationError(errors: Record<string, string>, origin?: string | null): NextResponse {
    const body = {
      success: false as const,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, {
      status: 422,
      headers: getAllowedOriginHeaders(origin),
    });
  }
}

function getErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };
  return codes[status] || 'UNKNOWN_ERROR';
}
