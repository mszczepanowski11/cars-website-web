export default defineEventHandler(async () => {
    const base = useRuntimeConfig().public.apiBase.replace(/\/$/, '')

    const [advertsR, eventsR, soldR, usersR, adminR] = await Promise.allSettled([
        fetch(`${base}/api/Advert?page=1&pageSize=1`).then(r => r.json()),
        fetch(`${base}/api/Event?page=1&pageSize=1`).then(r => r.json()),
        // Try multiple endpoints for sold count
        fetch(`${base}/api/Advert?status=Sold&page=1&pageSize=1`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        // Try multiple endpoints for user count
        fetch(`${base}/api/User/count`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        // Admin/public stats — may work without auth on some backends
        fetch(`${base}/api/Stats/home`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
    ])

    const activeAdverts = advertsR.status === 'fulfilled' ? (advertsR.value?.totalCount ?? 0) : 0
    const events        = eventsR.status === 'fulfilled'  ? (eventsR.value?.totalCount  ?? 0) : 0

    // Sold: try dedicated endpoint, then admin stats fallback, then 0
    const soldData  = soldR.status === 'fulfilled'  ? soldR.value  : null
    const adminData = adminR.status === 'fulfilled' ? adminR.value : null
    const soldVehicles = soldData?.totalCount
        ?? adminData?.soldVehicles
        ?? adminData?.totalSold
        ?? 0

    // Users: try /User/count, then admin stats, then 0
    const usersData  = usersR.status === 'fulfilled' ? usersR.value : null
    const totalUsers = (typeof usersData === 'number' ? usersData : usersData?.count)
        ?? adminData?.totalUsers
        ?? adminData?.usersCount
        ?? 0

    return { activeAdverts, events, soldVehicles, totalUsers }
})
