/**
 * 인메모리 Rate Limiter
 *
 * 참고: Vercel Serverless 환경에서는 함수 인스턴스마다 독립 Map이 생성되므로
 * 분산 환경에서는 정확한 제한이 보장되지 않습니다.
 * 고트래픽 프로덕션에서는 Upstash Redis (https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
 * 기반 @upstash/ratelimit 패키지로 교체를 권장합니다.
 *
 * @example
 * import { rateLimit } from '@/lib/rateLimit';
 * if (!rateLimit(ip, 10, 60_000)) return errorResponse('RATE_LIMITED', 429);
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/** 만료된 항목 정리 빈도 (호출 기준 확률) */
const CLEANUP_PROBABILITY = 0.05;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();

    // 확률적 정리: 메모리 누수 방지
    if (Math.random() < CLEANUP_PROBABILITY) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (now > v.resetTime) rateLimitMap.delete(k);
        }
    }

    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (entry.count >= limit) {
        return false;
    }

    entry.count += 1;
    return true;
}
