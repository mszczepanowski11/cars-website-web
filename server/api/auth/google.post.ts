export default defineEventHandler(async (event) => {
    rateLimit(event, 'google-login', 10, 60_000) // 10 per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
    }
    if (typeof body.credential !== 'string' || body.credential.length < 10 || body.credential.length > 4096) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid credential' })
    }

    try {
        const data = await $fetch<{ token: string; refreshToken?: string }>(
            `${config.public.apiBase}api/Auth/google`,
            { method: 'POST', body }
        )
        const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
        setCookie(event, 'auth_token', data.token, { ...cookieOpts, maxAge: 60 * 60 * 2 })
        if (data.refreshToken)
            setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
        setCookie(event, 'auth_status', '1', {
            httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/'
        })
        // Store JWT expiry so the client middleware can detect expired sessions
        try {
            const [, rawPayload] = data.token.split('.')
            const claims = JSON.parse(Buffer.from(rawPayload, 'base64').toString('utf8'))
            setCookie(event, 'auth_expiry', String(claims.exp as number), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })
        } catch { /* ignore */ }
        return { success: true }
    } catch (err: any) {
        const displayMsg = 'Logowanie przez Google nie powiodło się.'
        throw createError({
            statusCode: err.response?.status ?? err.status ?? 401,
            statusMessage: 'Unauthorized',
            message: displayMsg,
            data: { message: displayMsg }
        })
    }
})
