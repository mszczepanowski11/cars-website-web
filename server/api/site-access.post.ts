import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
    rateLimit(event, 'site-access', 10, 60_000) // 10 per minute per IP — brute-force protection

    const config = useRuntimeConfig(event)
    if (!config.sitePassword) {
        return { ok: true }
    }

    const body = await readBody<{ password?: string }>(event)
    if (!body || typeof body.password !== 'string' || body.password.length > 200) {
        return { ok: false }
    }

    const { password } = body

    if (password !== config.sitePassword) {
        return { ok: false }
    }

    setCookie(event, 'site-access', config.sitePassword, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    })
    // Non-httpOnly companion flag so the client-side maintenance middleware can
    // detect authenticated sessions without reading the actual password value.
    setCookie(event, 'site-access-ok', '1', {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    })

    return { ok: true }
})
