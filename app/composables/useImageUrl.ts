export const useImageUrl = () => {
    const config = useRuntimeConfig()
    const placeholder = '/car-placeholder.svg'

    function getImageUrl(url: string | undefined | null, fallback = placeholder): string {
        if (!url) return fallback
        const base = config.public.apiBase.replace(/\/$/, '')
        // Convert backend /uploads/ URL to Nuxt proxy /img/ (avoids adblocker rules on /uploads/)
        if (url.startsWith(base + '/uploads/')) {
            return '/img/' + url.slice(base.length + '/uploads/'.length)
        }
        if (url.startsWith('/uploads/')) {
            return '/img/' + url.slice('/uploads/'.length)
        }
        return url
    }

    return { getImageUrl, placeholder }
}
