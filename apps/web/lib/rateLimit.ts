import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash Rate Limiter (distributed)
 * 
 * Vercel serverless 환경에서 정확한 요청 제한을 보장하기 위해
 * 인메모리 Map 대신 Upstash Redis를 사용하여 상태를 전역적으로 공유합니다.
 */

// Upstash 환경변수가 없으면 폴백으로 항상 허용
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const writeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:write',
    })
  : null;

const readLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      prefix: 'rl:read',
    })
  : null;

/**
 * 전역 요청 제한 함수
 * 
 * @param key 구분값 (보통 IP)
 * @param type 'read' (조회성 - 20회/60초) | 'write' (생성/삭제 - 10회/60초)
 * @returns 허용 여부
 */
export async function rateLimit(
  key: string,
  type: 'read' | 'write' = 'write'
): Promise<boolean> {
  const limiter = type === 'read' ? readLimiter : writeLimiter;
  
  // Upstash 미설정 시 안전하게 통과 (Fallback)
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    // Redis 장애 시에도 서비스가 중단되지 않도록 통과
    console.error('RateLimit Error:', err);
    return true;
  }
}
