export default defineEventHandler(async (event) => {
    rateLimit(event, 'stats-home', 60, 60_000) // 60 per minute per IP

    const base = useRuntimeConfig().public.apiBase.replace(/\/$/, '')

    const [advertsR, eventsR, adminR] = await Promise.allSettled([
        fetch(`${base}/api/Advert?page=1&pageSize=1`).then(r => r.json()),
        fetch(`${base}/api/Event?page=1&pageSize=1`).then(r => r.json()),
        fetch(`${base}/api/Stats/home`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
    ])

    const advertData = advertsR.status === 'fulfilled' ? advertsR.value : null
    const eventsData = eventsR.status === 'fulfilled'  ? eventsR.value  : null
    const adminData  = adminR.status === 'fulfilled'   ? adminR.value   : null

    // Prefer dedicated Stats/home endpoint (accurate counts), fallback to search totals
    const activeAdverts = adminData?.activeAdverts ?? advertData?.totalCount ?? 0
    const soldVehicles  = adminData?.soldVehicles ?? 0
    const totalUsers    = adminData?.totalUsers ?? 0
    const events        = adminData?.events ?? eventsData?.totalCount ?? 0

    return { activeAdverts, events, soldVehicles, totalUsers }
})
