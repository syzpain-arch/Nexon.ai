import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { metricsRegistry } from '../utils/metrics.js';

interface RequestBucket {
  count: number;
  resetTime: number;
}

const ipBuckets: Map<string, RequestBucket> = new Map();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX;

  let bucket = ipBuckets.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + windowMs };
    ipBuckets.set(ip, bucket);
  } else {
    bucket.count++;
  }

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000));

  if (bucket.count > maxRequests) {
    logger.warn('RateLimiter', `Rate limit exceeded for IP: ${ip}`);
    metricsRegistry.recordError('RATE_LIMIT_EXCEEDED', req.path);
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please back off before initiating further Jarvis directives.',
      retryAfterSeconds: Math.ceil((bucket.resetTime - now) / 1000),
    });
    return;
  }

  next();
}
