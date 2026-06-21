export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const refreshToken = getCookie(event, 'refresh_token')
    if (refreshToken) {
        try {
            await $fetch(`${config.public.apiBase}api/Auth/logout`, {
                method: 'POST', body: { refreshToken }
            })
        } catch {}
    }
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'refresh_token')
    deleteCookie(event, 'auth_status')
    deleteCookie(event, 'auth_expiry')
    return { success: true }
})
