export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
        ?? event.node.req.socket?.remoteAddress
        ?? 'unknown'

    const { analytics, marketing, timestamp } = body ?? {}

    console.info(JSON.stringify({
        type: 'cookie_consent',
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        timestamp: timestamp ?? new Date().toISOString(),
        ip,
        userAgent: getRequestHeader(event, 'user-agent') ?? '',
    }))

    return { ok: true }
})
