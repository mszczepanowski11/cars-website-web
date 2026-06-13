export default defineNuxtRouteMiddleware((to) => {
    const authStatus = useCookie('auth_status')
    if (!authStatus.value) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})