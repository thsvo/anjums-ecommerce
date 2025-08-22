import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR'
}

// Custom error class
export class APIError extends Error {
  public statusCode: number;
  public type: ErrorType;
  public details?: any;

  constructor(message: string, statusCode: number, type: ErrorType, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.name = 'APIError';
  }
}

// Error response interface
interface ErrorResponse {
  error: string;
  type: ErrorType;
  timestamp: string;
  path?: string;
  details?: any;
  requestId?: string;
}

// Generate unique request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log error with context
function logError(error: Error | APIError, req: NextApiRequest, requestId: string) {
  const errorInfo = {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof APIError && {
        type: error.type,
        statusCode: error.statusCode,
        details: error.details
      })
    }
  };

  console.error('API Error:', JSON.stringify(errorInfo, null, 2));
}

// Convert Prisma errors to APIError
function handlePrismaError(error: PrismaClientKnownRequestError): APIError {
  switch (error.code) {
    case 'P2002':
      return new APIError(
        'A record with this information already exists',
        409,
        ErrorType.CONFLICT,
        { field: error.meta?.target }
      );
    case 'P2025':
      return new APIError(
        'Record not found',
        404,
        ErrorType.NOT_FOUND
      );
    case 'P2003':
      return new APIError(
        'Foreign key constraint failed',
        400,
        ErrorType.VALIDATION,
        { field: error.meta?.field_name }
      );
    default:
      return new APIError(
        'Database operation failed',
        500,
        ErrorType.DATABASE,
        { code: error.code }
      );
  }
}

// Main error handler
export function handleAPIError(
  error: Error | APIError,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestId = generateRequestId();
  
  // Log the error
  logError(error, req, requestId);

  let apiError: APIError;

  // Convert different error types to APIError
  if (error instanceof APIError) {
    apiError = error;
  } else if (error instanceof PrismaClientKnownRequestError) {
    apiError = handlePrismaError(error);
  } else if (error.name === 'JsonWebTokenError') {
    apiError = new APIError(
      'Invalid authentication token',
      401,
      ErrorType.AUTHENTICATION
    );
  } else if (error.name === 'TokenExpiredError') {
    apiError = new APIError(
      'Authentication token has expired',
      401,
      ErrorType.AUTHENTICATION
    );
  } else if (error.name === 'ValidationError') {
    apiError = new APIError(
      error.message,
      400,
      ErrorType.VALIDATION
    );
  } else {
    // Generic internal server error
    apiError = new APIError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      500,
      ErrorType.INTERNAL
    );
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: apiError.message,
    type: apiError.type,
    timestamp: new Date().toISOString(),
    path: req.url,
    requestId
  };

  // Include details in development mode
  if (process.env.NODE_ENV !== 'production' && apiError.details) {
    errorResponse.details = apiError.details;
  }

  // Send error response
  res.status(apiError.statusCode).json(errorResponse);
}

// Async wrapper for API handlers
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleAPIError(error as Error, req, res);
    }
  };
}

// Common validation errors
export const ValidationErrors = {
  REQUIRED_FIELD: (field: string) => new APIError(
    `${field} is required`,
    400,
    ErrorType.VALIDATION,
    { field }
  ),
  INVALID_EMAIL: () => new APIError(
    'Invalid email format',
    400,
    ErrorType.VALIDATION,
    { field: 'email' }
  ),
  INVALID_PASSWORD: () => new APIError(
    'Password must be at least 6 characters long',
    400,
    ErrorType.VALIDATION,
    { field: 'password' }
  ),
  INVALID_CREDENTIALS: () => new APIError(
    'Invalid email or password',
    401,
    ErrorType.AUTHENTICATION
  ),
  UNAUTHORIZED: () => new APIError(
    'Access denied',
    401,
    ErrorType.AUTHENTICATION
  ),
  FORBIDDEN: () => new APIError(
    'Insufficient permissions',
    403,
    ErrorType.AUTHORIZATION
  ),
  NOT_FOUND: (resource: string) => new APIError(
    `${resource} not found`,
    404,
    ErrorType.NOT_FOUND,
    { resource }
  )
};