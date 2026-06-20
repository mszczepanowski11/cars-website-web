export default defineNuxtRouteMiddleware((to) => {
    const authStatus = useCookie('auth_status')
    const authExpiry = useCookie('auth_expiry')

    if (!authStatus.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // Check JWT expiry via the non-httpOnly cookie set at login time
    if (authExpiry.value) {
        const expiryMs = Number(authExpiry.value) * 1000
        if (expiryMs < Date.now()) {
            authStatus.value = null
            authExpiry.value = null
            return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        }
    }
})
