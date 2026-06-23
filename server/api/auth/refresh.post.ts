export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const refreshToken = getCookie(event, 'refresh_token')
    if (!refreshToken) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    try {
        const data = await $fetch<{ token: string; refreshToken: string }>(
            `${config.public.apiBase}api/Auth/refresh`,
            { method: 'POST', body: { refreshToken } }
        )
        const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
        setCookie(event, 'auth_token', data.token, { ...cookieOpts, maxAge: 60 * 60 * 2 })
        setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
        return { success: true }
    } catch {
        deleteCookie(event, 'auth_token')
        deleteCookie(event, 'refresh_token')
        deleteCookie(event, 'auth_status')
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Sesja wygasła. Zaloguj się ponownie.', data: { message: 'Sesja wygasła. Zaloguj się ponownie.' } })
    }
})
