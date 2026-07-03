import { defineEventHandler, getCookie, getRequestHeader, getRequestURL, sendRedirect } from 'h3'

const BYPASS_PREFIXES = ['/_nuxt/', '/api/', '/favicon', '/carizo-logo', '/fonts/', '/icons/']
// sitemap.xml/robots.txt must always be reachable regardless of the maintenance gate — Google's
// sitemap-fetch requests don't reliably carry a recognizable crawler User-Agent (confirmed live:
// Search Console reported the sitemap fetch got redirected HTML instead of XML), so these can't
// depend on the UA sniffing below like the rest of crawler access does.
const BYPASS_PATHS = ['/coming-soon', '/site-access', '/sitemap.xml', '/robots.txt']

// Social media and search engine crawlers should see real page content for proper OG previews
const CRAWLER_UA = /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|googlebot|bingbot|yandex/i

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    if (!config.sitePassword) return // maintenance mode disabled

    const url = getRequestURL(event)
    const path = url.pathname

    if (BYPASS_PATHS.some(p => path.startsWith(p))) return
    if (BYPASS_PREFIXES.some(p => path.startsWith(p))) return
    if (path.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?|css|js|map)$/)) return

    const ua = getRequestHeader(event, 'user-agent') ?? ''
    if (CRAWLER_UA.test(ua)) return // let crawlers through for proper OG previews

    const token = getCookie(event, 'site-access')
    if (token === config.sitePassword) return

    const dest = encodeURIComponent(path + url.search)
    return sendRedirect(event, `/coming-soon?from=${dest}`, 302)
})
