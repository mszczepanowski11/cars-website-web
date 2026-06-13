export const useImageUrl = () => {
    const config = useRuntimeConfig()
    const placeholder = '/car-placeholder.svg'

    function getImageUrl(url: string | undefined | null, fallback = placeholder): string {
        if (!url) return fallback
        const base = config.public.apiBase.replace(/\/$/, '')
        const lower = url.toLowerCase()
        const baseLower = base.toLowerCase()
        // Convert backend /uploads/ URL to Nuxt proxy /img/ (avoids adblocker rules on /uploads/)
        if (lower.startsWith(baseLower + '/uploads/')) {
            return '/img/' + url.slice(base.length + '/uploads/'.length)
        }
        if (lower.startsWith('/uploads/')) {
            return '/img/' + url.slice('/uploads/'.length)
        }
        return url
    }

    return { getImageUrl, placeholder }
}
