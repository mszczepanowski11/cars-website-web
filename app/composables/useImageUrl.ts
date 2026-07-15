export interface ImageTransformOptions {
    /** Target width in pixels; the proxy never upscales beyond the source. */
    width?: number
    /** Cloudinary quality value ('auto' or 1-100); ignored for local uploads. */
    quality?: number | 'auto'
    /** Output format; 'auto' lets Cloudinary content-negotiate (webp/avif) by Accept header. */
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
}

function appendTransform(proxyUrl: string, opts?: ImageTransformOptions): string {
    if (!opts) return proxyUrl
    const params = new URLSearchParams()
    if (opts.width) params.set('w', String(opts.width))
    if (opts.quality) params.set('q', String(opts.quality))
    if (opts.format) params.set('f', opts.format)
    const qs = params.toString()
    return qs ? `${proxyUrl}?${qs}` : proxyUrl
}

export const useImageUrl = () => {
    const config = useRuntimeConfig()
    const placeholder = '/car-placeholder.svg'

    function getImageUrl(url: string | undefined | null, fallback = placeholder, opts?: ImageTransformOptions): string {
        if (!url) return fallback
        const base = config.public.apiBase.replace(/\/$/, '')
        const lower = url.toLowerCase()
        const baseLower = base.toLowerCase()
        // Convert backend /uploads/adverts/ → /img/photos/ to avoid ad blocker blocking "adverts" in URL
        if (lower.startsWith(baseLower + '/uploads/adverts/')) {
            return appendTransform('/img/photos/' + url.slice(base.length + '/uploads/adverts/'.length), opts)
        }
        if (lower.startsWith(baseLower + '/uploads/')) {
            return appendTransform('/img/' + url.slice(base.length + '/uploads/'.length), opts)
        }
        if (lower.startsWith('/uploads/adverts/')) {
            return appendTransform('/img/photos/' + url.slice('/uploads/adverts/'.length), opts)
        }
        if (lower.startsWith('/uploads/')) {
            return appendTransform('/img/' + url.slice('/uploads/'.length), opts)
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
            return appendTransform('/img/cloudinary/' + afterHost.replace('/adverts/', '/photos/'), opts)
        }
        return url
    }

    return { getImageUrl, placeholder }
}
