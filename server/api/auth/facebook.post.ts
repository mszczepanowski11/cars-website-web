export default defineEventHandler(async (event) => {
    rateLimit(event, 'facebook-login', 10, 60_000) // 10 per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        const data = await $fetch<{ token: string; refreshToken?: string }>(
            `${config.public.apiBase}api/Auth/facebook`,
            { method: 'POST', body }
        )
        const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
        setCookie(event, 'auth_token', data.token, { ...cookieOpts, maxAge: 60 * 60 * 2 })
        if (data.refreshToken)
            setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
        setCookie(event, 'auth_status', '1', {
            httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 24 * 30, path: '/'
        })
        return { success: true }
    } catch (err: any) {
        throw createError({
            statusCode: err.response?.status ?? 401,
            statusMessage: err.data ?? 'Logowanie przez Facebook nie powiodło się.'
        })
    }
})
