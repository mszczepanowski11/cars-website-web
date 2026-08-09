interface BucketEntry { count: number; resetAt: number }

// NOTE: in-memory store — resets on each process restart and is not shared across
// multiple worker instances. For multi-replica deployments replace with a Redis-backed
// counter (e.g. @upstash/redis) so rate limiting is consistent across all instances.
const buckets = new Map<string, BucketEntry>()

// ip:key → { count, resetAt }
export function rateLimit(event: any, key: string, maxRequests: number, windowMs: number): void {
    // Audit SEC M2: use trusted IP sources, NOT the leftmost x-forwarded-for (client-controlled —
    // an attacker rotating that value gets a fresh bucket every request, bypassing the limit).
    // cf-connecting-ip is set by Cloudflare and can't be appended by the client; x-real-ip is set by
    // the reverse proxy; the socket peer is the last resort. Leftmost x-forwarded-for is dropped.
    const ip =
        getRequestHeader(event, 'cf-connecting-ip') ||
        getRequestHeader(event, 'x-real-ip') ||
        event.node?.req?.socket?.remoteAddress ||
        'unknown'

    const bucketKey = `${ip}:${key}`
    const now = Date.now()
    const entry = buckets.get(bucketKey)

    if (!entry || now > entry.resetAt) {
        buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
        return
    }

    entry.count++
    if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        const polishMsg = `Zbyt wiele prób. Spróbuj ponownie za ${retryAfter} sekund.`
        setResponseHeader(event, 'Retry-After', String(retryAfter))
        // statusMessage MUST be ASCII-only — Web Response API (used by Nitro) throws
        // TypeError on non-ASCII bytes in the status reason phrase, causing an unhandled
        // exception that Nitro returns as generic 500 "Server Error" instead of 429.
        throw createError({
            statusCode: 429,
            statusMessage: 'Too Many Requests',
            message: polishMsg,
            data: { message: polishMsg }
        })
    }
}
