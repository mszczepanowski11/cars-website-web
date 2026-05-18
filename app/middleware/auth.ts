export default defineNuxtRouteMiddleware(() => {
    const authStatus = useCookie('auth_status')
    if (!authStatus.value) return navigateTo('/login')
})