import { buildAdCardData } from '../../../utils/og/data'
import { renderAdCard } from '../../../utils/og/render'
import { resolveFormat, DEFAULT_FORMAT } from '../../../utils/og/formats'
import { getOrRenderCardUrl } from '../../../utils/og/cache'

// Premium "SAMOCHÓD DNIA" ad-card generator, shared across every social/ad surface via
// server/utils/og/{formats,data,render,cache,icons}.ts. This route serves the primary Open
// Graph 1200x630 card by default; pass ?format=instagram-post|instagram-story|facebook-story|
// linkedin|meta-ad-thumb|banner to render one of the other registered formats from the exact
// same template + advert data (see formats.ts for the registry).
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params?.id ?? ''
    const apiBase = config.public.apiBase.replace(/\/$/, '')
    const siteUrl = config.public.siteUrl

    const query = getQuery(event)
    const formatId = typeof query.format === 'string' ? query.format : DEFAULT_FORMAT

    // Redirect (not fetch-and-re-serve) to the static fallback - a self-referencing HTTP fetch
    // from within this same server to its own public URL is fragile in production (hairpin
    // routing, cold-start timing), and must never be the thing standing between a failure here
    // and getting SOME image back to the crawler.
    function fallbackRedirect() {
        return sendRedirect(event, '/og-image.jpg', 302)
    }

    try {
        const advert = await $fetch<any>(`${apiBase}/api/Advert/${id}`)
        const format = resolveFormat(formatId)

        const { url, persisted } = await getOrRenderCardUrl(advert, format.id, siteUrl)
        if (persisted && url) {
            setHeader(event, 'Cache-Control', 'public, max-age=3600')
            return sendRedirect(event, url, 302)
        }

        // Cloudinary isn't configured (local dev) or the upload failed - stream a freshly
        // rendered card directly instead, so the feature still works end to end without it.
        const data = buildAdCardData(advert, siteUrl)
        const jpeg = await renderAdCard(data, format)
        setHeader(event, 'Content-Type', 'image/jpeg')
        setHeader(event, 'Cache-Control', 'public, max-age=300')
        return jpeg
    } catch (err) {
        console.error(`[og/advert/${id}] card generation failed:`, err)
        return fallbackRedirect()
    }
})
