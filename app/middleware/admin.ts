export default defineNuxtRouteMiddleware(async () => {
    const authStatus = useCookie('auth_status')
    if (!authStatus.value) return navigateTo('/login')

    try {
        const data = await $fetch<{ isAdmin: boolean }>('/api/proxy/api/User/me')
        if (!data.isAdmin) return navigateTo('/dashboard')
    } catch {
        return navigateTo('/login')
    }
})