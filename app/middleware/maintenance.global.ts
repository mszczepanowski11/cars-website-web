const BYPASS = ['/coming-soon']

export default defineNuxtRouteMiddleware((to) => {
    const config = useRuntimeConfig()
    if (!config.public.maintenanceMode) return
    if (BYPASS.some(p => to.path.startsWith(p))) return

    const accessCookie = useCookie('site-access')
    if (!accessCookie.value) {
        return navigateTo(`/coming-soon?from=${encodeURIComponent(to.fullPath)}`)
    }
})
