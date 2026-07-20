const CHUNK_SIZE = 45_000

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

    const urls = await buildSitemapUrls()

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')

    // Below the sitemap protocol's per-file cap, /sitemap.xml stays a plain <urlset> exactly as
    // before. Only once the site actually has enough URLs to need it does this switch to a
    // <sitemapindex> pointing at /sitemaps/1.xml, /sitemaps/2.xml, ... (see sitemaps/[n].xml.ts) -
    // the old code silently stopped adding URLs past 45,000 instead of splitting, which would
    // have made every advert past that point permanently invisible to search engines.
    if (urls.length <= CHUNK_SIZE) {
        return renderUrlset(urls.map(u => ({ ...u, loc: `${siteUrl}${u.loc}` })), siteUrl)
    }

    const chunkCount = Math.ceil(urls.length / CHUNK_SIZE)
    const sitemaps = Array.from({ length: chunkCount }, (_, i) => `  <sitemap>
    <loc>${siteUrl}/sitemaps/${i + 1}.xml</loc>
  </sitemap>`).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`
})
