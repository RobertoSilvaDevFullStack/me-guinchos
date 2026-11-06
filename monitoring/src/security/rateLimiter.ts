export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  maxTrackedKeys?: number;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate Limiter em memória com janela deslizante por chave (IP),
 * limite máximo de chaves para proteção contra exaustão de memória (DDoS)
 * e limpeza automática de entradas expiradas.
 */
export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxTrackedKeys: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = Math.max(1000, config.windowMs);
    this.maxRequests = Math.max(1, config.maxRequests);
    this.maxTrackedKeys = config.maxTrackedKeys ?? 10000;
  }

  public consume(key: string, nowMs: number = Date.now()): {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
  } {
    const existing = this.buckets.get(key);

    if (existing && existing.resetAt > nowMs) {
      if (existing.count >= this.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - nowMs) / 1000)),
        };
      }
      existing.count += 1;
      return {
        allowed: true,
        remaining: Math.max(0, this.maxRequests - existing.count),
        retryAfterSeconds: 0,
      };
    }

    if (this.buckets.size >= this.maxTrackedKeys) {
      this.evictExpiredOrOldest(nowMs);
    }

    this.buckets.set(key, {
      count: 1,
      resetAt: nowMs + this.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - 1),
      retryAfterSeconds: 0,
    };
  }

  private evictExpiredOrOldest(nowMs: number): void {
    for (const [k, v] of this.buckets.entries()) {
      if (v.resetAt <= nowMs) {
        this.buckets.delete(k);
      }
    }
    if (this.buckets.size >= this.maxTrackedKeys) {
      const firstKey = this.buckets.keys().next().value;
      if (firstKey !== undefined) {
        this.buckets.delete(firstKey);
      }
    }
  }

  public clear(): void {
    this.buckets.clear();
  }
}
