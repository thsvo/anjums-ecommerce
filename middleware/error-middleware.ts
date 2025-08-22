import { NextApiRequest, NextApiResponse } from 'next';
import { handleAPIError } from '../lib/error-handler';

// Middleware to wrap API handlers with error handling
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleAPIError(error as Error, req, res);
    }
  };
}

// Rate limiting middleware (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      
      const clientData = requestCounts.get(clientId as string);
      
      if (!clientData || now > clientData.resetTime) {
        // Reset or initialize counter
        requestCounts.set(clientId as string, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        // Increment counter
        clientData.count++;
        
        if (clientData.count > maxRequests) {
          return res.status(429).json({
            error: 'Too many requests',
            type: 'RATE_LIMIT_ERROR',
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
          });
        }
      }
      
      await handler(req, res);
    };
  };
}

// CORS middleware
export function withCORS(
  origins: string[] = ['https://anjums.me', 'https://whatsapp-two-delta.vercel.app']
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const origin = req.headers.origin;
      
      if (origin && origins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      await handler(req, res);
    };
  };
}

// Method validation middleware
export function withMethods(allowedMethods: string[]) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (!req.method || !allowedMethods.includes(req.method)) {
        res.setHeader('Allow', allowedMethods.join(', '));
        return res.status(405).json({
          error: `Method ${req.method} not allowed`,
          type: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          allowedMethods
        });
      }
      
      await handler(req, res);
    };
  };
}

// Compose multiple middlewares
export function compose(...middlewares: Array<(handler: any) => any>) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}