const BYPASS = ['/coming-soon']

export default defineNuxtRouteMiddleware((to) => {
    const config = useRuntimeConfig()
    if (!config.public.maintenanceMode) return
    if (BYPASS.some(p => to.path.startsWith(p))) return

    // Use non-httpOnly companion flag; the actual httpOnly cookie is checked server-side.
    const accessOk = useCookie('site-access-ok')
    if (!accessOk.value) {
        return navigateTo(`/coming-soon?from=${encodeURIComponent(to.fullPath)}`)
    }
})
