import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event)
    if (!config.sitePassword) return { hasAccess: true }
    const token = getCookie(event, 'site-access')
    return { hasAccess: token === config.sitePassword }
})
