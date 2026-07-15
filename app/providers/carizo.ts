import { defineProvider } from '@nuxt/image/runtime'

// The `src` passed in is expected to already be a proxy-relative path produced by
// useImageUrl().getImageUrl() (i.e. /img/... or /img/cloudinary/...) - this provider's only
// job is translating @nuxt/image's width/quality/format modifiers into that proxy's own w/q/f
// query params, which server/routes/img/[...path].ts and img/cloudinary/[...path].ts apply.
export default defineProvider({
    getImage: (src, { modifiers } = {}) => {
        const params = new URLSearchParams()
        if (modifiers?.width) params.set('w', String(Math.round(Number(modifiers.width))))
        if (modifiers?.quality) params.set('q', String(modifiers.quality))
        if (modifiers?.format) params.set('f', String(modifiers.format))
        const qs = params.toString()
        return { url: qs ? `${src}${src.includes('?') ? '&' : '?'}${qs}` : src }
    }
})
