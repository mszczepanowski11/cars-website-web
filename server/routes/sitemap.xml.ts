export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')

    const staticRoutes = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/adverts', priority: '0.9', changefreq: 'hourly' },
        { loc: '/wydarzenia', priority: '0.8', changefreq: 'daily' },
        { loc: '/categories', priority: '0.7', changefreq: 'weekly' },
        { loc: '/pakiety', priority: '0.6', changefreq: 'monthly' },
        { loc: '/jak-to-dziala', priority: '0.5', changefreq: 'monthly' },
        { loc: '/regulamin', priority: '0.3', changefreq: 'monthly' },
        { loc: '/regulamin-b2b', priority: '0.3', changefreq: 'monthly' },
        { loc: '/polityka-prywatnosci', priority: '0.3', changefreq: 'monthly' },
        { loc: '/polityka-cookies', priority: '0.3', changefreq: 'monthly' },
        { loc: '/pomoc', priority: '0.4', changefreq: 'weekly' },
    ]

    const dynamicUrls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = []

    const sellerIds = new Set<number>()

    // Category-filtered listing views are indexable, distinct landing pages (adverts.vue sets a
    // category-aware title/description/canonical for these) - list them so Google can discover
    // and rank "Auta osobowe — ogłoszenia" etc. separately from the generic /adverts page.
    try {
        const categoriesRes = await $fetch<Array<{ id: number }>>(`${apiBase}/api/Taxonomy/categories`).catch(() => null)
        for (const cat of categoriesRes ?? []) {
            dynamicUrls.push({
                loc: `/adverts?categoryId=${cat.id}`,
                priority: '0.7',
                changefreq: 'daily',
            })
        }
    } catch { /* skip if API unavailable */ }

    try {
        let page = 1
        const PAGE_SIZE = 100
        while (true) {
            const advertsRes = await $fetch<{ items: Array<{ id: number; userId?: number; updatedAt?: string; createdAt?: string }>; totalCount: number }>(
                `${apiBase}/api/Advert/search`,
                { method: 'POST', body: { page, pageSize: PAGE_SIZE } }
            ).catch(() => null)

            if (!advertsRes?.items?.length) break

            for (const ad of advertsRes.items) {
                dynamicUrls.push({
                    loc: `/advert/${ad.id}`,
                    lastmod: (ad.updatedAt ?? ad.createdAt ?? '').split('T')[0] || undefined,
                    priority: '0.8',
                    changefreq: 'weekly',
                })
                if (ad.userId) sellerIds.add(ad.userId)
            }

            if (advertsRes.items.length < PAGE_SIZE || dynamicUrls.length >= 45000) break
            page++
        }
    } catch { /* skip if API unavailable */ }

    for (const sellerId of sellerIds) {
        dynamicUrls.push({
            loc: `/seller/${sellerId}`,
            priority: '0.6',
            changefreq: 'weekly',
        })
    }

    try {
        const eventsRes = await $fetch<Array<{ id: number; updatedAt?: string; createdAt?: string }>>(
            `${apiBase}/api/Event`,
            { query: { page: 1, pageSize: 500 } }
        ).catch(() => null)

        const list = Array.isArray(eventsRes) ? eventsRes : (eventsRes as any)?.items ?? []
        for (const ev of list) {
            dynamicUrls.push({
                loc: `/wydarzenie/${ev.id}`,
                lastmod: (ev.updatedAt ?? ev.createdAt ?? '').split('T')[0] || undefined,
                priority: '0.6',
                changefreq: 'weekly',
            })
        }
    } catch { /* skip if API unavailable */ }

    const now = new Date().toISOString().split('T')[0]

    const urls = [
        ...staticRoutes.map(r => ({ ...r, lastmod: now })),
        ...dynamicUrls,
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${siteUrl}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return xml
})
