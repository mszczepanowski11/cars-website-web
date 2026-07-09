export default defineEventHandler(async (event) => {
    rateLimit(event, 'facebook-login', 10, 60_000) // 10 per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
    }
    if (typeof body.accessToken !== 'string' || body.accessToken.length < 10 || body.accessToken.length > 4096) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid access token' })
    }

    try {
        const data = await $fetch<{ token?: string; refreshToken?: string; consentRequired?: boolean; name?: string; email?: string }>(
            `${config.public.apiBase}api/Auth/facebook`,
            { method: 'POST', body: { accessToken: body.accessToken, consentGiven: !!body.consentGiven } }
        )
        if (data.consentRequired) {
            // New account, not created yet - hand the preview straight back to the browser so it
            // can show the consent screen. No cookies are set at this point.
            return { consentRequired: true, name: data.name ?? '', email: data.email ?? '' }
        }
        const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
        setCookie(event, 'auth_token', data.token!, { ...cookieOpts, maxAge: 60 * 60 * 2 })
        if (data.refreshToken)
            setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
        setCookie(event, 'auth_status', '1', {
            httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/'
        })
        return { success: true }
    } catch (err: any) {
        const displayMsg = 'Logowanie przez Facebook nie powiodło się.'
        throw createError({
            statusCode: err.response?.status ?? err.status ?? 401,
            statusMessage: 'Unauthorized',
            message: displayMsg,
            data: { message: displayMsg }
        })
    }
})
