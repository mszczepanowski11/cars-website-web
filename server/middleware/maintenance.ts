import { defineEventHandler, getCookie, getRequestURL, sendRedirect } from 'h3'

const BYPASS_PREFIXES = ['/_nuxt/', '/api/', '/favicon', '/carizo-logo', '/fonts/', '/icons/']
const BYPASS_PATHS = ['/coming-soon', '/site-access']

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    if (!config.sitePassword) return // maintenance mode disabled

    const url = getRequestURL(event)
    const path = url.pathname

    if (BYPASS_PATHS.some(p => path.startsWith(p))) return
    if (BYPASS_PREFIXES.some(p => path.startsWith(p))) return
    if (path.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?|css|js|map)$/)) return

    const token = getCookie(event, 'site-access')
    if (token === config.sitePassword) return

    const dest = encodeURIComponent(path + url.search)
    return sendRedirect(event, `/coming-soon?from=${dest}`, 302)
})
