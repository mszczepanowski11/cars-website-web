const CHUNK_SIZE = 45_000

// A route pattern like "[n].xml.ts" mixing a dynamic segment with a literal suffix in the same
// filename does NOT reliably extract just the param value under Nitro (the captured param name/
// value ends up including the ".xml" suffix) - a catch-all avoids that by parsing the number out
// of the raw slug ourselves.
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

    const slug = event.context.params?.slug ?? ''
    const match = /^(\d+)\.xml$/.exec(slug)
    const n = match ? parseInt(match[1], 10) : NaN
    if (!Number.isInteger(n) || n < 1) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    const urls = await buildSitemapUrls()
    const start = (n - 1) * CHUNK_SIZE
    if (start >= urls.length) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
    const chunk = urls.slice(start, start + CHUNK_SIZE)

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return renderUrlset(chunk.map(u => ({ ...u, loc: `${siteUrl}${u.loc}` })), siteUrl)
})
