const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();

    // Cleanup expired entries periodically (e.g., 5% chance per call or just clear the current one)
    if (Math.random() < 0.05) {
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
