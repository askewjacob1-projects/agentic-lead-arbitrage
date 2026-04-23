import { Request, Response, NextFunction } from "express";

/**
 * Rate limiting implementation
 * Tracks requests per IP address and enforces limits
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiting middleware
 * Default: 100 requests per 15 minutes per IP
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    const record = rateLimitStore[ip];

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    // Increment counter
    record.count++;

    // Add rate limit headers
    res.set("X-RateLimit-Limit", maxRequests.toString());
    res.set("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count).toString());
    res.set("X-RateLimit-Reset", record.resetTime.toString());

    // Check if limit exceeded
    if (record.count > maxRequests) {
      res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Specific rate limits for sensitive endpoints
 */
export const rateLimits = {
  // Stripe webhook: more lenient (1000 per minute)
  webhook: rateLimit(1000, 60 * 1000),

  // Checkout: moderate (50 per minute)
  checkout: rateLimit(50, 60 * 1000),

  // API: standard (100 per 15 minutes)
  api: rateLimit(100, 15 * 60 * 1000),

  // Auth: strict (10 per minute)
  auth: rateLimit(10, 60 * 1000),

  // Download: moderate (20 per minute)
  download: rateLimit(20, 60 * 1000),
};

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  res.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://checkout.stripe.com"
  );

  // Referrer Policy
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );

  next();
}

/**
 * CORS configuration
 */
export function corsConfig(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.PRODUCTION_URL || "",
  ].filter(Boolean);

  if (allowedOrigins.includes(origin || "")) {
    res.set("Access-Control-Allow-Origin", origin || "");
    res.set("Access-Control-Allow-Credentials", "true");
  }

  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}

/**
 * Request validation middleware
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      res.status(400).json({
        error: "Content-Type must be application/json",
      });
      return;
    }
  }
  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const ip = getClientIp(req);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${ip}`;
    console.log(log);
  });

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("[Error]", err);

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment ? err.message : "Internal server error";

  res.status(500).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

/**
 * Cleanup rate limit store periodically
 * Prevents memory leaks from old entries
 */
export function startRateLimitCleanup(intervalMs: number = 60 * 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const ip in rateLimitStore) {
      if (rateLimitStore[ip].resetTime < now) {
        delete rateLimitStore[ip];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
    }
  }, intervalMs);
}
