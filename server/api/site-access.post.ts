import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    if (!config.sitePassword) {
        return { ok: true }
    }

    const { password } = await readBody<{ password: string }>(event)

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
