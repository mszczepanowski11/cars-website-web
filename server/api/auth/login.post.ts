export default defineEventHandler(async (event) => {
    rateLimit(event, 'login', 10, 60_000) // 10 attempts per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)
    try {
        const data = await $fetch<{ token: string }>(
            `${config.public.apiBase}api/Auth/login`,
            { method: 'POST', body }
        )
        setCookie(event, 'auth_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        })
        setCookie(event, 'auth_status', '1', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        })
        return { success: true }
    } catch (err: any) {
        throw createError({
            statusCode: err.response?.status ?? 401,
            statusMessage: err.data ?? 'Nieprawidłowy email lub hasło.'
        })
    }
})