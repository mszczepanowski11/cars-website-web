export const useImageUrl = () => {
    const config = useRuntimeConfig()
    const placeholder = '/car-placeholder.svg'

    function getImageUrl(url: string | undefined | null, fallback = placeholder): string {
        if (!url) return fallback
        const base = config.public.apiBase.replace(/\/$/, '')
        const lower = url.toLowerCase()
        const baseLower = base.toLowerCase()
        // Convert backend /uploads/adverts/ → /img/photos/ to avoid ad blocker blocking "adverts" in URL
        if (lower.startsWith(baseLower + '/uploads/adverts/')) {
            return '/img/photos/' + url.slice(base.length + '/uploads/adverts/'.length)
        }
        if (lower.startsWith(baseLower + '/uploads/')) {
            return '/img/' + url.slice(base.length + '/uploads/'.length)
        }
        if (lower.startsWith('/uploads/adverts/')) {
            return '/img/photos/' + url.slice('/uploads/adverts/'.length)
        }
        if (lower.startsWith('/uploads/')) {
            return '/img/' + url.slice('/uploads/'.length)
        }
        return url
    }

    return { getImageUrl, placeholder }
}
