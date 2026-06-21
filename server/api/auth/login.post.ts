export default defineEventHandler(async (event) => {
    rateLimit(event, 'login', 10, 60_000) // 10 attempts per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (config.turnstileSecretKey) {
        const ip = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestHeader(event, 'x-forwarded-for') ?? ''
        const valid = await verifyTurnstile(body.turnstileToken ?? '', config.turnstileSecretKey, ip)
        if (!valid) throw createError({ statusCode: 400, statusMessage: 'Weryfikacja CAPTCHA nie powiodła się.' })
    }

    const { turnstileToken: _t, ...loginBody } = body

    try {
        const data = await $fetch<{ token: string; refreshToken?: string }>(
            `${config.public.apiBase}api/Auth/login`,
            { method: 'POST', body: loginBody }
        )
        const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
        setCookie(event, 'auth_token', data.token, { ...cookieOpts, maxAge: 60 * 60 * 2 })
        if (data.refreshToken)
            setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
        setCookie(event, 'auth_status', '1', {
            httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 24 * 30, path: '/'
        })
        // Store JWT expiry so the client middleware can detect expired sessions
        try {
            const [, rawPayload] = data.token.split('.')
            const claims = JSON.parse(Buffer.from(rawPayload, 'base64').toString('utf8'))
            setCookie(event, 'auth_expiry', String(claims.exp as number), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })
        } catch { /* ignore */ }
        return { success: true }
    } catch (err: any) {
        throw createError({
            statusCode: err.response?.status ?? 401,
            statusMessage: err.data ?? 'Nieprawidłowy email lub hasło.'
        })
    }
})
