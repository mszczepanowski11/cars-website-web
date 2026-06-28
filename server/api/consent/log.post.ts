export default defineEventHandler(async (event) => {
    rateLimit(event, 'consent-log', 20, 60_000) // 20 per minute per IP

    const body = await readBody(event)
    if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
    }

    const analytics = typeof body.analytics === 'boolean' ? body.analytics : Boolean(body.analytics)
    const marketing = typeof body.marketing === 'boolean' ? body.marketing : Boolean(body.marketing)
    const timestamp = typeof body.timestamp === 'string' ? body.timestamp.slice(0, 30) : new Date().toISOString()

    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
        ?? event.node.req.socket?.remoteAddress
        ?? 'unknown'

    console.info(JSON.stringify({
        type: 'cookie_consent',
        analytics,
        marketing,
        timestamp,
        ip,
        userAgent: getRequestHeader(event, 'user-agent') ?? '',
    }))

    return { ok: true }
})
