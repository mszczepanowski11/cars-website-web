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

    return { ok: true }
})
