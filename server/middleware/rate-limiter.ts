import rateLimit from 'express-rate-limit';
import { Redis } from 'ioredis';
import { type Request, type Response, type NextFunction } from 'express';

// Initialize Redis for distributed rate limiting
const redis = new Redis(process.env.REDIS_URL);

// User tier limits
const USER_TIERS = {
  free: {
    interviews: { max: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
    aiRequests: { max: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
    tokensPerDay: 50000 // ~50k tokens per day
  },
  pro: {
    interviews: { max: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10 per day
    aiRequests: { max: 200, windowMs: 60 * 60 * 1000 }, // 200 per hour
    tokensPerDay: 200000 // ~200k tokens per day
  },
  enterprise: {
    interviews: { max: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day
    aiRequests: { max: 1000, windowMs: 60 * 60 * 1000 }, // 1000 per hour
    tokensPerDay: 1000000 // ~1M tokens per day
  }
};

// Token tracking middleware
export const tokenTracker = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.uid) return next();

  const today = new Date().toISOString().split('T')[0];
  const tokenKey = `tokens:${req.user.uid}:${today}`;
  
  try {
    // Get user's tier and token usage
    const userTier = (req.user.tier || 'free') as keyof typeof USER_TIERS;
    const tokensUsed = parseInt(await redis.get(tokenKey) || '0');
    const tokenLimit = USER_TIERS[userTier].tokensPerDay;

    // Estimate tokens for this request (can be refined based on actual prompt length)
    const estimatedTokens = req.body?.prompt?.length || 0;
    
    if (tokensUsed + estimatedTokens > tokenLimit) {
      return res.status(429).json({
        error: 'Daily token limit exceeded',
        tokensUsed,
        tokenLimit,
        nextReset: `${today}T23:59:59Z`
      });
    }

    // Store token usage in request for logging
    req.tokenUsage = estimatedTokens;
    
    // Update token count after the response
    res.on('finish', async () => {
      await redis.incrby(tokenKey, req.tokenUsage || 0);
      await redis.expireat(tokenKey, Math.floor(new Date(today + 'T23:59:59Z').getTime() / 1000));
    });

    next();
  } catch (error) {
    console.error('Token tracking error:', error);
    next();
  }
};

// Create a limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis as store for distributed rate limiting
  store: {
    incr: (key: string) => redis.incr(key),
    decrement: (key: string) => redis.decr(key),
    resetKey: (key: string) => redis.del(key),
  }
});

// Dynamic limiter for AI-powered endpoints based on user tier
export const aiLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userTier = (req.user.tier || 'free') as keyof typeof USER_TIERS;
  const limits = USER_TIERS[userTier].aiRequests;

  const limiter = rateLimit({
    windowMs: limits.windowMs,
    max: limits.max,
    message: {
      error: 'AI request limit reached',
      limit: limits.max,
      windowMs: limits.windowMs,
      userTier,
      upgrade: userTier === 'free' ? 'Consider upgrading to Pro for increased limits' : undefined
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => `ai:${req.user?.uid}:${Math.floor(Date.now() / limits.windowMs)}`,
    store: {
      incr: (key: string) => redis.incr(key),
      decrement: (key: string) => redis.decr(key),
      resetKey: (key: string) => redis.del(key),
    }
  });

  return limiter(req, res, next);
};

// Interview session limiter based on user tier
export const interviewLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userTier = (req.user.tier || 'free') as keyof typeof USER_TIERS;
  const limits = USER_TIERS[userTier].interviews;

  const limiter = rateLimit({
    windowMs: limits.windowMs,
    max: limits.max,
    message: {
      error: 'Daily interview limit reached',
      limit: limits.max,
      windowMs: limits.windowMs,
      userTier,
      upgrade: userTier === 'free' ? 'Upgrade to Pro for more daily interviews' : undefined
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => `interview:${req.user?.uid}:${new Date().toISOString().split('T')[0]}`,
    store: {
      incr: (key: string) => redis.incr(key),
      decrement: (key: string) => redis.decr(key),
      resetKey: (key: string) => redis.del(key),
    }
  });

  return limiter(req, res, next);
};