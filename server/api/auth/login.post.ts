export default defineEventHandler(async (event) => {
    rateLimit(event, 'login', 10, 60_000) // 10 attempts per minute per IP
    const config = useRuntimeConfig()

    // readBody can return null for empty/malformed requests — guard early so no
    // TypeError leaks outside the try/catch and causes Nitro to emit "Server Error".
    const body = await readBody(event)
    if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
    }

    if (config.turnstileSecretKey) {
        const ip = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestHeader(event, 'x-forwarded-for') ?? ''
        const valid = await verifyTurnstile(body.turnstileToken ?? '', config.turnstileSecretKey, ip)
        if (!valid) throw createError({ statusCode: 400, statusMessage: 'Captcha failed' })
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
        // Extract a safe error message. statusMessage MUST be ASCII-only — Node.js HTTP
        // module throws on non-ASCII chars (e.g. Polish letters) in the status line,
        // which would cause an unhandled TypeError → Nitro "Server Error".
        // Keep the Polish text in the `message` field for the client to display.
        const rawMsg: string = typeof err.data === 'string'
            ? err.data
            : (typeof err.data?.message === 'string' ? err.data.message : '')
        const statusCode: number = err.response?.status ?? err.status ?? 401

        // Map known C# error strings to safe display messages
        const displayMsg = rawMsg.toLowerCase().includes('captcha') ? 'Weryfikacja CAPTCHA nie powiodła się.'
            : rawMsg.toLowerCase().includes('zablok') ? 'Konto zostało zablokowane.'
            : rawMsg.toLowerCase().includes('zweryfikuj') || rawMsg.toLowerCase().includes('email') ? 'Zweryfikuj swój adres email przed zalogowaniem.'
            : rawMsg.length > 0 && rawMsg.length < 120 && !rawMsg.trimStart().startsWith('<') ? rawMsg
            : 'Nieprawidłowy email lub hasło.'

        throw createError({
            statusCode,
            statusMessage: statusCode === 429 ? 'Too Many Requests' : 'Unauthorized',
            message: displayMsg,
            data: { message: displayMsg }
        })
    }
})
