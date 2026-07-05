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
        // Older images were uploaded to Cloudinary with a public_id starting "adverts/..." (fixed
        // for new uploads, but that segment is permanently baked into already-uploaded assets'
        // URLs). Ad-blocker filter lists commonly block any request URL containing "/adverts/" -
        // proxy these through our own domain with that segment swapped to "photos", same as the
        // local-upload alias above, so the browser-visible request never contains the blocked text.
        const cloudinaryHost = 'res.cloudinary.com/'
        const hostIdx = lower.indexOf(cloudinaryHost)
        if (hostIdx !== -1 && lower.includes('/adverts/')) {
            const afterHost = url.slice(hostIdx + cloudinaryHost.length)
            return '/img/cloudinary/' + afterHost.replace('/adverts/', '/photos/')
        }
        return url
    }

    return { getImageUrl, placeholder }
}
