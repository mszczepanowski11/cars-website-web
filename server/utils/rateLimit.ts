interface BucketEntry { count: number; resetAt: number }

// NOTE: in-memory store — resets on each process restart and is not shared across
// multiple worker instances. For multi-replica deployments replace with a Redis-backed
// counter (e.g. @upstash/redis) so rate limiting is consistent across all instances.
const buckets = new Map<string, BucketEntry>()

// ip:key → { count, resetAt }
export function rateLimit(event: any, key: string, maxRequests: number, windowMs: number): void {
    const ip =
        getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
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
