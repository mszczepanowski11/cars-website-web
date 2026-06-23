// Redirect to login when the proxy returns 401 (session expired after failed token refresh)
export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter()

    nuxtApp.hook('app:error', (error: any) => {
        const status = error?.statusCode ?? error?.response?.status
        if (status === 401) {
            const path = router.currentRoute.value?.fullPath ?? '/'
            if (!path.startsWith('/login') && !path.startsWith('/register')) {
                navigateTo(`/login?redirect=${encodeURIComponent(path)}`)
            }
        }
    })
})
